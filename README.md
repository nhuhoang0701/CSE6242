# CSE 6242 Project

## Description

Welcome to our CSE 6242 project!
Here's our github repository: https://github.com/nhuhoang0701/CSE6242/tree/main

You can explore our visualization components for the project through these files:

- `frontend/src/routes/AnalyticsReport.tsx`: This file defines the `AnalyticsReport`, `EmotionPieChart`, `WordFrequencyChart`, `PaginatedTable`, and `WordCloud` component
  - The `AnalyticsReport` component visualizes keyword trends with bar and pie charts, a word cloud, and an original Reddit post table.
  - The `WordFrequencyChart` component, counts topic frequencies and visualizes the top 5 most common topics as a horizontal bar chart.
  - The `EmotionPieChart` component calculates the distribution of emotions, and visualizes them as a pie chart, alongside a legend displaying emotion counts and their corresponding colors.
  - The `PaginatedTable` component shows a paginated table of Reddit posts containing the searched keywords
  - The `WordCloud` component allows users to see relevant words to their input at a glance. It has been integrated into AnalyticsReport.tsx.
  
- `frontend/src/components/ui.tsx`: This file defines the `UI` component, a feature-rich visualization tool for exploring Reddit sentiment data across U.S. states, integrating D3.js to create an interactive map with zoom and tooltip functionality, a customizable legend, and Chakra UI for layout and modals, while supporting dynamic keyword searches, year selection, and sentiment analysis visualization through a connected analytics report.
- `backend/app/api/routes`: This folder contains code for all APIs, responsible for getting emotions, and keywords for state and college levels.
- `backend/app/main.py`: This is the entry FastAPI point to run the server.
- `backend/app/models.py`: This file contains the Pydantic models used by FastAPI.
- `backend/app/utils.py`: This file contains all utility functions, including filtering posts by keywords, inferring topics using BERT, and predicting emotions. 

## Installation
### Dataset Preparation

We maintain two copies of the dataset:

- Backend: Primary data source, put this [file](https://drive.google.com/file/d/1VXZiF0uowT5Pjp5XTi8BpA_GYAlpGiOX/view) under `./backend/app`
- Frontend: Cache for quick post retrieval, reducing API calls. Download dataset from [this folder](https://drive.google.com/drive/folders/1pK1mY4Aw6qfTwROUiOu9P07D0omYgOwk) and replace `data_2019~2022` with downloaded files under `./frontend/dataset`

### Frontend
Before you begin, ensure that you have Fast Node Manager (fnm) on your system.

- To install fnm follow the [official fnm guide](https://github.com/Schniz/fnm#installation).

- After installing fnm, go to the `frontend` directory:

```bash
cd frontend
```

- Install NodeJS using the command:

```bash
fnm install
```

- Once the installation is done, use the installed version:

```bash
fnm use
```

- Within the `frontend` directory, install all NPM packages:

```bash
npm install
```
### Backend

#### Requirements

- [Python](https://www.python.org/) for the backend. **IMPORTANT: Can only use python 3.6 - 3.9 due to a dependency conflict in BERT!**
- [uv](https://docs.astral.sh/uv/) for Python package and environment management.

#### Setup
By default, the dependencies are managed with [uv](https://docs.astral.sh/uv/), go there and install it.

First, from `./backend/`, set up the virtual environment with:

```console
cd backend
python3 -m venv .venv
```

Then you can activate the virtual environment with:

```console
source .venv/bin/activate
```

Then you can install all the dependencies with:

```console
python -m pip install uv
uv pip install
```

Next, we need to generate the database `reddit_posts.db`. **It should only be done once**. You can do that by running the following utility script:
```console
cd ./app
python3 utils.py
```

## Execution

### Frontend

Start the live server with the following `npm` command:

```bash
npm run dev
```

Then open your browser at http://localhost:5173/ui

### Backend

Go back to `backend` and use the `fastapi run --reload` command to run the debug live reloading server.

```console
$ fastapi run --reload
```

You can then check the interactive Swagger docs at http://localhost:8000/docs

## Credit

This project structure is based on the [FastAPI template](https://github.com/fastapi/full-stack-fastapi-template) by [Tiangolo](https://github.com/tiangolo).
