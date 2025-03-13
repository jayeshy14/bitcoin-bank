#[macro_use]
extern crate napi_derive;

pub mod models;
pub mod simulator;
pub mod api;

use models::emi::EmiResult;
use models::emi::LoanParams;
use simulator::loan_simulation::run_simulation;
use simulator::loan_simulation::SimulationResult;

use models::emi::calculate_emi;

#[napi]
pub fn call_simulate(
    principal_btc: f64,
    price_at_loan_time: f64,
    monthly_interest_rate: f64,
    risk_percentage: f64,
    loan_time_in_months: u32,
) -> SimulationResult {
    run_simulation(
        principal_btc,
        price_at_loan_time,
        monthly_interest_rate,
        risk_percentage,
        loan_time_in_months,
    )
}

#[napi]
pub fn call_calculate_emi(
    principal_btc: f64,
    price_at_loan_time: f64,
    monthly_interest_rate: f64,
    risk_percentage: f64,
    loan_time_in_months: u32,
    current_price: f64,
) -> EmiResult {
    
    let params = LoanParams {
        principal_btc,
        price_at_loan_time,
        monthly_interest_rate,
        risk_percentage,
        loan_time_in_months,
    };

    calculate_emi(&params, current_price)
}
