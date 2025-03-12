use rand::{rngs::ThreadRng, seq::IndexedRandom};

const HISTORICAL_CHANGES: [f64; 167] = [
    9.54, -17.5, -3.07,
    0.87, 44.0, 16.3, -14.7, 11.1, -7.02, 3.09, -8.73, 7.11, 11.2, 37.4, -3.19,
    39.9, -0.01, 23.1, 3.05, -7.10, 11.9, -4.04, -11.2, 3.99, 28.5, 8.87, 11.9,
    -16.9, 12.2, 5.51, -17.2, -15.9, -37.9, 17.7, -14.0, -3.10, 5.55, -16.1, -3.70,
    14.3, 36.0, 30.1, -1.89, -35.4, -6.38, 19.7, 14.0, -7.30, 40.0, -7.12, -18.9,
    29.6, 8.21, -24.9, 34.1, 9.52, -3.15, 24.2, 2.54, -7.96, 28.1, 42.9, 47.8,
    -7.96, 10.9, 6.13, 32.4, 58.5, 27.1, -6.88, -4.66, -14.0, 10.5, -17.4, -4.74,
    -28.1, 5.64, -35.1, 34.4, -18.7, -15.4, 21.1, -9.28, -5.77, -4.67, -36.4, -6.40,
    0.70, 21.5, -9.17, 25.8, 69.6, 8.41, 15.4, 63.8, -7.72, 49.0, 58.9, 38.8,
    -14.4, 18.5, -4.84, 7.57, 18.5, 26.8, -7.11, -7.87, 5.94, 14.9, 6.32, 29.2,
    -32.1, 17.2, -3.96, -3.31, -2.44, 14.3, 8.09, -19.2, 2.52, 33.1, 19.8, 14.1,
    9.93, -33.7, -16.9, -2.05, 39.3, 2.58, -8.60, -18.5, -19.0, -12.7, 11.6, -15.3,
    49.9, 54.9, 50.5, -7.19, -25.0, 8.80, 27.4, -1.58, 53.8, -33.2,
    17.5, -11.7, -0.24, 3.07, 2.91, 29.2, 40.2, 14.8, 13.1, -9.96, 15.2, 6.56,
    73.7, 65.2, -8.61, 334.6, 85.3, -15.9, -32.3, -44.4, -35.1, -11.5
];


const TOKEN_DECIMALS: f64 = 100000000.0;

fn simulate_monthly_price(base_price: f64, months: u32) -> Vec<f64> {
    let mut rng = ThreadRng::default();
    let mut prices = Vec::new();
    let mut current_price: f64 = base_price as f64;
    let mut month_calulate = 0;
    while month_calulate < months {
        let change = *HISTORICAL_CHANGES.choose(&mut rng).unwrap();
        if change > 40.0 {
            continue;
        }
        current_price *= (100.0 + change) / 100.0;
        prices.push(current_price); 
        month_calulate += 1;
    }
    prices
}

fn calculate_emi(
    l_principal_usd: f64,
    monthly_interest_rate: f64,
    risk_percentage: f64,
    price_at_loan_time: f64,
    current_price: f64,
    loan_time_in_months: u32
) -> (f64, f64, f64, f64) {
    //Let's Suppose l_principle_usd = 100,000 usd 
    let r = monthly_interest_rate / 100.0; //If monthly interest rate is 1%, r = 0.01

    let risk_factor = risk_percentage / 100.0; //If risk percentage is 40% then risk_factor = 0.4

    //If the principle loan amount is given in usd then we can calculate fixed_btc by multiplying 
    //risk_factor to  total btc amount which can be calculated by dividing principle amount by price at loan time
    //If the price of 1 BTC is 100,000 usd, then btc_fixed = 0.4 * ( 100,000 usd / 100,000 usd ) = 0.4 BTC
    let btc_fixed = risk_factor * (l_principal_usd / price_at_loan_time);

    //Suppose the loan is taken for 18 months
    //Compound interest plus principle = 0.4 BTC * (1 + 0.01) ^ 18 = 0.47845899027 BTC approx 
    //So 0.4 BTC is principle amount and the rest 0.07845899027 BTC is compound interest at 1% interest rate calculated monthly
    let compound_interest_plus_btc_fixed = btc_fixed * (1 + r) ^ loan_time_in_months;

    //btc_variable_usd_value = (0.6) * (100,000 usd) = 60,000 usd
    let btc_variable_usd_value = (1.0 - risk_factor) * ( l_principal_usd );

    //Compound interest plus btc variable usd value = 60,000 usd (1.01) ^ 18 = 71768.8485412 usd approx
    //So 60,000 usd is principle amount and the rest 17,768.8485412 usd is compound interest at 1% interest rate calculated monthly
    let compound_interest_plus_btc_variable_usd_value = btc_variable_usd_value * (1 + r) ^ loan_time_in_months;

    //btc_fixed_monthly_emi = 0.47845899027 BTC / 18 months = 0.02658105501 BTC to be paid monthly as fixed BTC 
    let btc_fixed_monthly_emi = compound_interest_plus_btc_fixed / loan_time_in_months; 

    //btc_variable_usd_value_monthly_emi = 71768.8485412 usd / 18 months = 3987.15825229 usd to be paid monthly as variable BTC usd value
    let btc_variable_usd_value_monthly_emi = compound_interest_plus_btc_variable_usd_value / loan_time_in_months;

    // This is just a conversion of btc_variable_usd_value_monthly_emi into its btc value
    let btc_variable_monthly_emi = btc_variable_usd_value_monthly_emi / current_price;

    //The total BTC amount which needs to be paid monthly = btc_fixed_monthly_emi + btc_variable_monthly_emi
    let total_emi_in_btc = btc_fixed_monthly_emi + btc_variable_monthly_emi;

    //This is just a conversion of total_btc_emi into usd 
    let total_emi_in_usd = total_btc_emi * current_price;
    
    (btc_fixed_monthly_emi, btc_variable_monthly_emi, total_emi_in_btc, total_emi_in_usd);
}

fn main() {
    let price_at_loan_time = 100000.0;
    // 100,000

    let principle_btc = 1.0;

    // principle_usd = 1.0 * 100,000 usd = 100,000 usd 
    let principle_usd = principle_btc * price_at_loan_time;

    //This is a monthly interest rate, as our interest will be compounded monthly
    let monthly_interest_rate = 1.0;

    //This is risk percentage
    let risk_percentage = 40.0;

    //Loan time in months
    let loan_time_in_months = 18;

    //No need to calculate simulate price, because we'll be passing current price each month at the time of emi calculation
    let simulate_price = simulate_monthly_price(price_at_loan_time, loan_year * 12);
    println!("simulate_price: {:?}", simulate_price);
    
    let mut total_repayment_in_usd = 0.0;
    let mut total_interest_paid = 0.0;
    let mut total_fixed_emi_sats = 0.0;
    let mut total_variable_emi_sats = 0.0;
    let mut total_repayment_btc = 0.0;

    for (month, current_price) in simulate_price.iter().enumerate() {
        let (btc_fixed_monthly_emi, btc_variable_monthly_emi, total_emi_in_btc, total_emi_in_usd) = calculate_emi(
            principal_usd, 
            monthly_interest_rate, 
            risk_percentage, 
            price_at_loan_time, 
            *current_price, 
            loan_time_in_months
        );

        total_repayment_usd += total_emi_in_usd;
        //1 BTC = 99959862 sats
        total_fixed_emi_sats += btc_fixed_monthly_emi * 99959862;
        total_variable_emi_sats += btc_variable_monthly_emi * 99959862;
        total_repayment_btc += total_emi_in_btc;

        println!(
            "Month {}: Current BTC Price: ${:.2}, Fixed EMI: {} sat, Variable EMI: {} sat, Total USD EMI: ${:.2}, TOTAL BTC EMI: ${:.2}",
            month + 1,
            current_price,
            total_fixed_emi_sats,
            total_variable_emi_sats,
            total_repayment_usd,
            total_repayment_btc,
        );

    }
    println!("--- Simulation Summary ---");
    println!("Total Repayment (USD): ${:.2}", total_repayment_usd);
    println!("Total Repayment (BTC): {:.2}", total_repayment_btc);
    println!("Total Fixed Repayment (sats): {}", total_fixed_emi_sats);
    println!("Total Variable Repayment (sats): {}", total_variable_emi_sats);
}
