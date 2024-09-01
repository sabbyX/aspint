from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_avail_slots():
    response = client.post(
        "/instance/new-application",
        json={'email': 'nogaf50833@hapied.com', 'password': 'Test@123', 'issuer': 'gbLON2ch'}
    )
    assert response.status_code == 200
    print(response.json())

