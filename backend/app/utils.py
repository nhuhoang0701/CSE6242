from typing import List

import polars as pl
from bertopic import BERTopic


def get_data() -> pl.DataFrame:
    # return pd.read_csv("app/roberta2022_combined_states.csv")
    return pl.read_csv(
        "app/roberta2022_combined_states.csv",
        dtypes={
            "Unnamed: 0": pl.Int64,
            "body": pl.Utf8,
            "emo_pred_pos": pl.Float64,
            "emo_pred_neu": pl.Float64,
            "emo_pred_neg": pl.Float64,
            "College": pl.Utf8,
            "Year": pl.Float64,
            "preprocessed_text": pl.Utf8,
            "FullCollegeName": pl.Utf8,
            "State": pl.Utf8,
        },
        ignore_errors=True,
    )


def get_posts_containing_keywords(df, keywords: List[str]) -> List[str]:
    posts = []
    texts = df.get_column("preprocessed_text").to_list()

    for text in texts:
        try:
            text = str(text)
            if any(keyword.strip().lower() in text.lower() for keyword in keywords):
                posts.append(text)
        except Exception as e:
            # Optionally log the exception or handle it
            print(f"Error processing item: {text}, Error: {e}")

    return posts


def topic_model(cleaned_docs: List[str]):
    # Initialize the topic model with a fixed number of topics
    if len(cleaned_docs) < 10:
        return {}

    topic_model = BERTopic(nr_topics=10)
    topics, _ = topic_model.fit_transform(cleaned_docs)

    prob_by_word = {}

    for topic in set(topics):
        if topic != -1:  # Exclude the outlier topic
            topic_words = topic_model.get_topic(topic)
            for word, prob in topic_words:
                prob_by_word[word] = float(prob)

    return prob_by_word
