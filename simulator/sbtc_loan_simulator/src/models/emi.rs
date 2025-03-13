use napi_derive::napi;

#[napi(object)]
pub struct LoanParams {
    pub principal_btc: f64,
    pub price_at_loan_time: f64,
    pub monthly_interest_rate: f64,
    pub risk_percentage: f64,
    pub loan_time_in_months: u32,
}

#[napi(object)]
pub struct EmiResult {
    pub btc_fixed_monthly_emi: f64,
    pub btc_variable_monthly_emi: f64,
    pub total_emi_in_btc: f64,
    pub total_emi_in_usd: f64,
}

pub fn calculate_emi(params: &LoanParams, current_price: f64) -> EmiResult {
    let LoanParams {
        principal_btc,
        price_at_loan_time,
        monthly_interest_rate,
        risk_percentage,
        loan_time_in_months,
    } = *params;

    let l_principal_usd = principal_btc * price_at_loan_time;
    let r = monthly_interest_rate / 100.0;
    let risk_factor = risk_percentage / 100.0;

    let btc_fixed = risk_factor * (l_principal_usd / price_at_loan_time);
    let compound_interest_plus_btc_fixed = btc_fixed * (1.0 + r).powf(loan_time_in_months as f64);
    let btc_variable_usd_value = (1.0 - risk_factor) * l_principal_usd;
    let compound_interest_plus_btc_variable_usd_value =
        btc_variable_usd_value * (1.0 + r).powf(loan_time_in_months as f64);

    let btc_fixed_monthly_emi = compound_interest_plus_btc_fixed / loan_time_in_months as f64;
    let btc_variable_usd_value_monthly_emi =
        compound_interest_plus_btc_variable_usd_value / loan_time_in_months as f64;
    let btc_variable_monthly_emi = btc_variable_usd_value_monthly_emi / current_price;
    let total_emi_in_btc = btc_fixed_monthly_emi + btc_variable_monthly_emi;
    let total_emi_in_usd = total_emi_in_btc * current_price;

    EmiResult {
        btc_fixed_monthly_emi,
        btc_variable_monthly_emi,
        total_emi_in_btc,
        total_emi_in_usd,
    }
}
