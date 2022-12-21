```shell
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
gdown https://drive.google.com/u/1/uc?id=1bCD_fCcFHPH3n2cmVxNXqWJngZj6HOL6&export=download
unzip archive.zip -d data
python scripts/bootstrap_db.py
flask --app aoe run
```