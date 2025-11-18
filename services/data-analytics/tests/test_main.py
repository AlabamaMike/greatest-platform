import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient
import sys
import os

# Add parent directory to path to import main module
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


@pytest.fixture
async def async_client():
    """Create an async test client."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


class TestHealthEndpoint:
    """Tests for the health endpoint."""

    def test_health_check(self, client):
        """Test the health check endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
        assert response.json()["service"] == "data-analytics-service"


class TestSDGTracking:
    """Tests for SDG tracking endpoints."""

    def test_get_sdg_data_valid_goal(self, client):
        """Test getting SDG data for a valid goal."""
        response = client.get("/api/v1/data/sdg/3")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["goal"] == 3
        assert data["data"]["name"] == "Good Health and Well-being"
        assert "progress" in data["data"]
        assert "indicators" in data["data"]

    def test_get_sdg_data_invalid_goal_too_low(self, client):
        """Test getting SDG data with goal number too low."""
        response = client.get("/api/v1/data/sdg/0")
        assert response.status_code == 400
        assert "must be between 1 and 17" in response.json()["detail"]

    def test_get_sdg_data_invalid_goal_too_high(self, client):
        """Test getting SDG data with goal number too high."""
        response = client.get("/api/v1/data/sdg/18")
        assert response.status_code == 400
        assert "must be between 1 and 17" in response.json()["detail"]

    def test_get_all_indicators(self, client):
        """Test getting all SDG indicators."""
        response = client.get("/api/v1/data/indicators")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["total_indicators"] > 0
        assert "summary" in data["data"]
        assert isinstance(data["data"]["summary"], list)


class TestAnalytics:
    """Tests for analytics endpoints."""

    def test_run_analytics_query(self, client):
        """Test running an analytics query."""
        query_data = {
            "query_type": "aggregation",
            "filters": {"region": "Africa"},
            "aggregation": "sum"
        }
        response = client.post("/api/v1/data/analytics/query", json=query_data)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["query_type"] == query_data["query_type"]
        assert "results" in data["data"]
        assert "execution_time_ms" in data["data"]


class TestOpenData:
    """Tests for open data platform endpoints."""

    def test_get_datasets(self, client):
        """Test getting available datasets."""
        response = client.get("/api/v1/data/datasets")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert isinstance(data["data"], list)
        assert len(data["data"]) > 0
        # Check dataset structure
        dataset = data["data"][0]
        assert "id" in dataset
        assert "name" in dataset
        assert "format" in dataset
        assert "download_url" in dataset

    def test_export_data_csv(self, client):
        """Test exporting data in CSV format."""
        response = client.post("/api/v1/data/export?format=csv")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["format"] == "csv"
        assert "export_id" in data["data"]
        assert "download_url" in data["data"]

    def test_export_data_json(self, client):
        """Test exporting data in JSON format."""
        response = client.post("/api/v1/data/export?format=json")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["format"] == "json"


class TestDashboards:
    """Tests for dashboard endpoints."""

    def test_get_global_health_dashboard(self, client):
        """Test getting the global health dashboard."""
        response = client.get("/api/v1/data/dashboards/global_health")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["name"] == "Global Health Impact Dashboard"
        assert "widgets" in data["data"]
        assert len(data["data"]["widgets"]) > 0

    def test_get_sdg_progress_dashboard(self, client):
        """Test getting the SDG progress dashboard."""
        response = client.get("/api/v1/data/dashboards/sdg_progress")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["name"] == "SDG Progress Tracker"
        assert "widgets" in data["data"]

    def test_get_nonexistent_dashboard(self, client):
        """Test getting a dashboard that doesn't exist."""
        response = client.get("/api/v1/data/dashboards/nonexistent")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()


class TestImpactMetrics:
    """Tests for impact measurement endpoints."""

    def test_get_impact_metrics(self, client):
        """Test getting platform impact metrics."""
        response = client.get("/api/v1/data/impact")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        metrics = data["data"]
        assert "users_served" in metrics
        assert "healthcare_consultations" in metrics
        assert "courses_completed" in metrics
        assert "jobs_created" in metrics
        assert "sdg_contributions" in metrics
        assert metrics["users_served"] > 0


class TestPredictiveAnalytics:
    """Tests for predictive analytics endpoints."""

    def test_predict_outbreak(self, client):
        """Test outbreak prediction."""
        response = client.post("/api/v1/data/predict?model_type=outbreak")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "prediction" in data["data"]
        assert "probability" in data["data"]
        assert 0 <= data["data"]["probability"] <= 1

    def test_predict_demand(self, client):
        """Test demand prediction."""
        response = client.post("/api/v1/data/predict?model_type=demand")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "prediction" in data["data"]
        assert "regions" in data["data"]


class TestResearchData:
    """Tests for research data access endpoints."""

    def test_get_research_datasets(self, client):
        """Test getting research datasets."""
        response = client.get("/api/v1/data/research/datasets")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert isinstance(data["data"], list)
        if len(data["data"]) > 0:
            dataset = data["data"][0]
            assert "id" in dataset
            assert "title" in dataset
            assert "anonymization" in dataset
            assert "access" in dataset
