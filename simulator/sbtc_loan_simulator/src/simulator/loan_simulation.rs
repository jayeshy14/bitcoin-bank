use crate::models::emi::{LoanParams, calculate_emi};
use crate::simulator::random_price::simulate_monthly_price;
use crate::api::handlers::SimulationResult;


pub fn run_simulation(
    principal_btc: f64,
    price_at_loan_time: f64,
    monthly_interest_rate: f64,
    risk_percentage: f64,
    loan_time_in_months: u32,
) -> SimulationResult {
    let simulated_prices = simulate_monthly_price(price_at_loan_time, loan_time_in_months);
    
    let params = LoanParams {
        principal_btc,
        price_at_loan_time,
        monthly_interest_rate,
        risk_percentage,
        loan_time_in_months,
    };

    println!("--- Loan Simulation ---");
    let mut total_repayment_in_usd = 0.0;
    let mut total_repayment_in_btc = 0.0;
    let mut total_variable_emi_sats = 0.0;
    let mut total_fixed_emi_sats = 0.0;

    for (month, &current_price) in simulated_prices.iter().enumerate() {
        let emi_result = calculate_emi(&params, current_price);
        total_repayment_in_usd += emi_result.total_emi_in_usd;
        total_repayment_in_btc += emi_result.total_emi_in_btc;
        total_fixed_emi_sats += emi_result.btc_fixed_monthly_emi * current_price;
        total_variable_emi_sats += emi_result.btc_variable_monthly_emi * current_price;

        println!(
            "Month {}: BTC Price: ${:.2}, Total EMI: {:.6} BTC (${:.2})",
            month + 1, current_price, emi_result.total_emi_in_btc, emi_result.total_emi_in_usd
        );
    }

    SimulationResult {
        total_repayment_in_usd,
        total_repayment_in_btc,
        total_fixed_emi_sats,
        total_variable_emi_sats,
    }
}
