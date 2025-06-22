import json
import os

BASE_DIR = os.path.join(os.path.dirname(__file__), '..', 'examples', 'project-split')


def load_json(path):
    with open(os.path.join(BASE_DIR, path), encoding='utf-8') as f:
        return json.load(f)


def test_project_json_basic():
    data = load_json('project.json')
    assert 'projectId' in data
    assert 'title' in data
    assert isinstance(data.get('shots'), list)
    assert len(data['shots']) > 0

    shot = data['shots'][0]
    for key in ['id', 'technique', 'timing', 'tasks', 'crew']:
        assert key in shot

    task = shot['tasks'][0]
    for key in ['id', 'task', 'dept', 'timestamps']:
        assert key in task

    crew_member = shot['crew'][0]
    for key in ['role', 'dept', 'name']:
        assert key in crew_member


def test_features_json():
    feats = load_json('features.json')
    assert isinstance(feats, list)
    assert feats
    feat = feats[0]
    for key in ['id', 'title', 'description']:
        assert key in feat


def test_task_file():
    task = load_json(os.path.join('tasks', 't-001.json'))
    assert task['id'] == 't-001'
    assert task['dept'] == 'CAM'
    assert 'timestamps' in task

