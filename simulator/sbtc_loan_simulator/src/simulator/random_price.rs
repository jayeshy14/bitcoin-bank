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

pub fn simulate_monthly_price(base_price: f64, months: u32) -> Vec<f64> {
    let mut rng = ThreadRng::default();
    let mut prices = Vec::with_capacity(months as usize);
    let mut current_price = base_price;

    for _ in 0..months {
        let change = *HISTORICAL_CHANGES.choose(&mut rng).unwrap();
        current_price *= (100.0 + change) / 100.0;
        prices.push(current_price);
    }
    prices
}
