## Description
This project serves as the website for analyzing different topics through Reddit data from 128 U.S. universities (2019-2022). Uses topic modeling and emotion classification to extract insights from student discussions with lots of interactive visualizations.

Key features:
- Reddit data analysis from university subreddits
- Topic modeling & emotion classification
- Interactive sentiment visualization

## Installation
### Dataset Preparation

We maintain two copies of the dataset:

- Backend: Primary data source, put this [file](https://drive.google.com/file/d/1VXZiF0uowT5Pjp5XTi8BpA_GYAlpGiOX/view) under `./backend/app`
- Frontend: Cache for quick post retrieval, reducing API calls. Put [this folder](https://drive.google.com/drive/folders/1pK1mY4Aw6qfTwROUiOu9P07D0omYgOwk) under `./frontend`

### Frontend
Before you begin, ensure that you have either the Node Version Manager (nvm) or Fast Node Manager (fnm) installed on your system.

- To install fnm follow the [official fnm guide](https://github.com/Schniz/fnm#installation). If you prefer nvm, you can install it using the [official nvm guide](https://github.com/nvm-sh/nvm#installing-and-updating).

- After installing either nvm or fnm, proceed to the `frontend` directory:

```bash
cd frontend
```

- If the Node.js version specified in the `.nvmrc` file isn't installed on your system, you can install it using the appropriate command:

```bash
# If using fnm
fnm install

# If using nvm
nvm install
```

- Once the installation is complete, switch to the installed version:

```bash
# If using fnm
fnm use

# If using nvm
nvm use
```

- Within the `frontend` directory, install the necessary NPM packages:

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

Start the live server with the following `npm` script:

```bash
npm run dev
```

Then open your browser at http://localhost:5173/ui.

### Backend

Go back to `backend` and use the `fastapi run --reload` command to run the debug live reloading server.

```console
$ fastapi run --reload
```

and then hit enter. That runs the live reloading server that auto reloads when it detects code changes.

You can then check the interactive Swagger docs at http://localhost:8000/docs

## Credit

This project structure is based on the [FastAPI template](https://github.com/fastapi/full-stack-fastapi-template) by [Tiangolo](https://github.com/tiangolo).
