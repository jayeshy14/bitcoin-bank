use crate::simulator::loan_simulation::run_simulation;
use axum::{http::StatusCode, Json};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct LoanInput {
    principal_btc: f64,
    price_at_loan_time: f64,
    monthly_interest_rate: f64,
    risk_percentage: f64,
    loan_time_in_months: u32,
}

#[derive(Debug, Serialize)]
pub struct SimulationResult {
    pub total_repayment_in_usd: f64,
    pub total_repayment_in_btc: f64,
    pub total_fixed_emi_sats: f64,
    pub total_variable_emi_sats: f64,
}

pub async fn root() -> &'static str {
    "Hello world"
}

pub async fn simulate(Json(input): Json<LoanInput>) -> (StatusCode, Json<SimulationResult>) {
    let result = run_simulation(
        input.principal_btc,
        input.price_at_loan_time,
        input.monthly_interest_rate,
        input.risk_percentage,
        input.loan_time_in_months,
    );

    let send = SimulationResult {
        total_repayment_in_usd: result.total_repayment_in_usd,
        total_repayment_in_btc: result.total_repayment_in_btc,
        total_fixed_emi_sats: result.total_fixed_emi_sats,
        total_variable_emi_sats: result.total_variable_emi_sats,
    };

    (StatusCode::CREATED, Json(send))
}

