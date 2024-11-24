import torch
import torch.nn.functional as F
from transformers import AutoModelForSequenceClassification, AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("ayoubkirouane/BERT-Emotions-Classifier")
model = AutoModelForSequenceClassification.from_pretrained(
    "ayoubkirouane/BERT-Emotions-Classifier"
)


def get_texts_containing_keywords(df, keywords: list[str]):
    results = []
    texts = df["preprocessed_text"].tolist()

    for text in texts:
        try:
            text = str(text)
            if any(keyword in text.lower() for keyword in keywords):
                results.append(text)
        except Exception as e:
            print(f"Error processing item: {text}, Error: {e}")
    return results


def topicModel(cleaned_docs):
    # Initialize the topic model with a fixed number of topics
    if len(cleaned_docs) < 10:
        return "Not enough information"
    else:
        topic_model = BERTopic(nr_topics=10)
        # Fit the model on the cleaned documents
        topics, probabilities = topic_model.fit_transform(cleaned_docs)

        all_words = []
        # Loop through each topic and filter words based on sports_keywords
        for topic in set(topics):
            if topic != -1:  # Exclude the outlier topic
                topic_words = topic_model.get_topic(topic)

                if topic_words:
                    filtered_words = [word for word, _ in topic_words]
                    if filtered_words and len(filtered_words) != 0:
                        all_words.append(filtered_words)
        return all_words


def predict_emotion(text: str):
    tokens = tokenizer(text, return_tensors="pt", truncation=False)
    if tokens["input_ids"].size(1) > 512:
        print("Input text exceeds token limit. Truncating to fit.")
        inputs = tokenizer(text[:300], return_tensors="pt", truncation=True)
    else:
        inputs = tokens

    with torch.no_grad():
        outputs = model(**inputs)

    logits = outputs.logits
    probs = F.softmax(logits, dim=-1)
    predicted_class = torch.argmax(probs, dim=1).item()
    print("Probabilities:", probs)
    return predicted_class
