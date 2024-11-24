import sqlite3
from typing import List

import pandas as pd
import polars as pl
import torch
import torch.nn.functional as F
from bertopic import BERTopic
from transformers import AutoModelForSequenceClassification, AutoTokenizer


def get_reddit_posts_csv() -> pl.DataFrame:
    return pl.read_csv(
        "filtered_df.csv",
        columns=[
            "emo_pred_pos",
            "emo_pred_neu",
            "emo_pred_neg",
            "College",
            "Year",
            "preprocessed_text",
            "FullCollegeName",
            "State",
        ],
        dtypes={
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
    ).rename(
        {
            "emo_pred_pos": "positive",
            "emo_pred_neu": "neutral",
            "emo_pred_neg": "negative",
            "College": "college",
            "Year": "year",
            "preprocessed_text": "text",
            "FullCollegeName": "full_college_name",
            "State": "state",
        }
    )


def get_state_df(state: str, year: int) -> pl.DataFrame:
    conn = sqlite3.connect("app/reddit_posts.db")
    df = pd.read_sql_query(
        "SELECT * FROM reddit_posts WHERE state = ? AND year = ?;",
        conn,
        params=[state, year],
    )
    conn.close()
    return pl.from_pandas(df)


def get_college_df(college: str, year: int) -> pl.DataFrame:
    conn = sqlite3.connect("app/reddit_posts.db")
    df = pd.read_sql_query(
        "SELECT * FROM reddit_posts WHERE college = ? AND year = ?;",
        conn,
        params=[college, year],
    )
    conn.close()
    return pl.from_pandas(df)


def get_posts_containing_keywords(df: pl.DataFrame, keywords: List[str]) -> List[str]:

    posts = []
    texts = df.get_column("text").to_list()

    for text in texts:
        try:
            text = str(text)
            if any(keyword.strip().lower() in text.lower() for keyword in keywords):
                posts.append(text)
        except Exception as e:
            # Optionally log the exception or handle it
            print(f"Error processing item: {text}, Error: {e}")

    return posts


def get_posts_df(df: pl.DataFrame, keywords: List[str]) -> pl.DataFrame:
    df = df.with_columns(pl.col("text").cast(pl.Utf8))

    keyword_conditions = [
        pl.col("text").str.contains(keyword.strip().lower()) for keyword in keywords
    ]
    mask = keyword_conditions[0]
    for condition in keyword_conditions[1:]:
        mask = mask | condition

    filtered_df = df.filter(mask)
    return filtered_df


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


if __name__ == "__main__":
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS reddit_posts (
        positive REAL,
        neutral REAL,
        negative REAL,
        college TEXT,
        year REAL,
        text TEXT,
        full_college_name TEXT,
        state TEXT
    );
    """

    import sqlite3

    df = get_reddit_posts_csv()
    print(df.head())
    df = df.to_pandas()
    conn = sqlite3.connect("reddit_posts.db")
    conn.execute(create_table_sql)

    df.to_sql("reddit_posts", conn, if_exists="replace", index=True)

    import pandas as pd

    df = pd.read_sql_query("SELECT * FROM reddit_posts;", conn)
    print(df.head())

    conn.close()
