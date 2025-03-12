mod models;
mod simulator;
mod api;

use axum::{routing::{get, post}, Router};
use api::handlers::{root, simulate};

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/", get(root))
        .route("/simulate", post(simulate));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

// curl -X POST "http://127.0.0.1:8080/simulate"      -H "Content-Type: application/json"      -d '{
//     "principal_btc": 1.0,
//     "price_at_loan_time": 50000.0,
//     "monthly_interest_rate": 0.01,
//     "risk_percentage": 0.05,
//     "loan_time_in_months": 12
//   }'