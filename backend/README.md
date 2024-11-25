# FastAPI Project - Backend

## Requirements

- [Python](https://www.python.org/) for the backend. **IMPORTANT: Can only use python 3.6 - 3.9 due to a dependency conflict in BERT!**
- [uv](https://docs.astral.sh/uv/) for Python package and environment management.

## General Workflow

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

Then, go back to `backend` and use the `fastapi run --reload` command to run the debug live reloading server.

```console
$ fastapi run --reload
```

and then hit enter. That runs the live reloading server that auto reloads when it detects code changes.
