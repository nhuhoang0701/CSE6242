# CSE 6242 Project

## Description

Welcome to our CSE 6242 project!

You can explore our visulization components for the project through these files:

- `frontend/src/routes/AnalyticsReport.tsx`: This file defines the AnalyticsReport component, which visualizes keyword trends with bar and pie charts, a word cloud, and a orignial Reddit post table.

- `frontend/src/routes/CommonWordsBarChart.tsx`: This file defines the `CommonWordsBarChart` component, which counts word frequencies, and visualizes the top 5 most common words as a horizontal bar chart.
  
- `frontend/src/routes/EmotionPieChart.tsx` : This code defines the EmotionPieChart component, which calculates the distribution of emotions, and visualizes them as a pie chart, alongside a legend displaying emotion counts and their corresponding colors.
  
- `frontend/src/routes/WordCloud.tsx` : This code defines the Word3DCloud component, which allows users to see relevent words to their input at a glance. It has been integrated into AnalyticsReport.tsx.
  
- `frontend/src/components/ui.tsx` : This file defines the `UI` component, a feature-rich visualization tool for exploring Reddit sentiment data across U.S. states, integrating D3.js to create an interactive map with zoom and tooltip functionality, a customizable legend, and Chakra UI for layout and modals, while supporting dynamic keyword searches, year selection, and sentiment analysis visualization through a connected analytics report.

## Datasets

We maintain two copies of the dataset:

- Backend: Primary data source, put this [file](https://drive.google.com/file/d/1VXZiF0uowT5Pjp5XTi8BpA_GYAlpGiOX/view) under `./backend/app`
- Frontend: Cache for quick post retrieval, reducing API calls. Download the dataset from [this folder](https://drive.google.com/drive/folders/1pK1mY4Aw6qfTwROUiOu9P07D0omYgOwk) and replace them with `data_2019 ~ data_2022` under `./frontend/dataset`

## Frontend

Please refer to the [frontend](./frontend/README.md) directory for the frontend guildeline.

## Backend

Please refer to the [backend](./backend/README.md) directory for the backend guildeline.

## Credit

This project is based on the [FastAPI template](https://github.com/fastapi/full-stack-fastapi-template) by [Tiangolo](https://github.com/tiangolo).
