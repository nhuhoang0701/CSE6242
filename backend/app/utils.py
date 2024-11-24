from typing import List

import polars as pl
import torch
import torch.nn.functional as F
from bertopic import BERTopic
from transformers import AutoModelForSequenceClassification, AutoTokenizer


def get_data() -> pl.DataFrame:
    return pl.read_csv(
        "app/filtered_df.csv",
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


def get_map_sentiment(df: pl.DataFrame, keywords: List[str]) -> dict:
    df = df.with_columns(pl.col("preprocessed_text").cast(pl.Utf8))

    keyword_conditions = [
        pl.col("preprocessed_text").str.contains(keyword.strip().lower())
        for keyword in keywords
    ]
    mask = keyword_conditions[0]
    for condition in keyword_conditions[1:]:
        mask = mask | condition

    filtered_df = df.filter(mask)

    result = filtered_df.group_by("State").agg(
        [
            pl.col("emo_pred_pos").mean().alias("positive"),
            pl.col("emo_pred_neu").mean().alias("neutral"),
            pl.col("emo_pred_neg").mean().alias("negative"),
        ]
    )

    # Convert to dictionary format
    state_sentiments = {}
    for row in result.iter_rows(named=True):
        state = row["State"]
        sentiments = {
            "positive": float(row["positive"]),
            "neutral": float(row["neutral"]),
            "negative": float(row["negative"]),
        }
        state_sentiments[state] = sentiments

    return state_sentiments


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


def predict_emotion(text: str):
    tokenizer = AutoTokenizer.from_pretrained("ayoubkirouane/BERT-Emotions-Classifier")
    model = AutoModelForSequenceClassification.from_pretrained(
        "ayoubkirouane/BERT-Emotions-Classifier"
    )
    tokens = tokenizer(text, return_tensors="pt", truncation=False)
    if tokens["input_ids"].size(1) > 512:
        print("Input text exceeds token limit. Truncating to fit.")
        inputs = tokenizer(text[:300], return_tensors="pt", truncation=True)
    else:
        inputs = tokens

    # Continue with the usual process

    with torch.no_grad():
        outputs = model(**inputs)

    logits = outputs.logits
    probs = F.softmax(logits, dim=-1)
    predicted_class = torch.argmax(probs, dim=1).item()
    return predicted_class
