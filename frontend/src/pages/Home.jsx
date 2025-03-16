import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion as Motion } from 'framer-motion';

const Home = () => {
  const { user } = useAuth();

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-gray-900 text-gray-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background elements - darker overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 via-indigo-900/95 to-purple-900/95"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center mix-blend-multiply opacity-60"></div>
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Animated Bitcoin elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <Motion.div
              key={i}
              initial={{ 
                x: Math.random() * 100 - 50, 
                y: -20, 
                opacity: 0.3 + Math.random() * 0.5 
              }}
              animate={{ 
                y: ['0%', '100%'],
                x: `calc(${Math.sin(i) * 10}% + ${i * 15}%)`,
                opacity: [0.3 + Math.random() * 0.5, 0.1]
              }}
              transition={{ 
                duration: 15 + Math.random() * 20, 
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute w-12 h-12 text-yellow-400/40"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
              </svg>
            </Motion.div>
          ))}
        </div>
        
        {/* Content - brighter text */}
        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <Motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-purple-200">
              Unlock the Value of Your Bitcoin
            </h1>
            <p className="text-xl md:text-2xl text-white mb-8">
              Secure, transparent, and efficient Bitcoin-backed loans using gold and property as collateral.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user ? (
                <>
                  <Link
                    to="/register"
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Create Account
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 py-3 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-white/30"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/borrow"
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Apply for a Loan
                  </Link>
                  <Link
                    to="/dashboard"
                    className="px-8 py-3 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-white/30"
                  >
                    Go to Dashboard
                  </Link>
                </>
              )}
            </div>
          </Motion.div>
          
          {/* Stats - brighter elements */}
          <Motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-16"
          >
            {[
              { value: "$10M+", label: "Loans Funded" },
              { value: "1,000+", label: "Happy Clients" },
              { value: "100%", label: "Secure Storage" }
            ].map((stat, index) => (
              <div key={index} className="bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-blue-200">{stat.label}</div>
              </div>
            ))}
          </Motion.div>
        </div>
      </section>
      
      {/* Features Section - brighter text */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <Motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Why Choose Bitcoin Loan Bank?</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We provide a secure platform for Bitcoin-backed loans with competitive rates and flexible terms.
            </p>
          </Motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                title: "Secure Storage",
                description: "Your Bitcoin is stored in multi-signature wallets with industry-leading security protocols."
              },
              {
                icon: (
                  <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                ),
                title: "Transparent Terms",
                description: "Clear loan terms with no hidden fees. Know exactly what you're paying from day one."
              },
              {
                icon: (
                  <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: "Fast Processing",
                description: "Get your loan approved and funded quickly with our streamlined application process."
              },
              {
                icon: (
                  <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Competitive Rates",
                description: "Enjoy some of the most competitive interest rates in the crypto lending market."
              },
              {
                icon: (
                  <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Collateral Options",
                description: "Use gold or property as collateral to secure your Bitcoin loan with flexible terms."
              },
              {
                icon: (
                  <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                ),
                title: "Smart Contracts",
                description: "Our loans are powered by blockchain technology, ensuring transparency and security."
              }
            ].map((feature, index) => (
              <Motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-blue-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-400/10"
              >
                <div className="bg-blue-900/30 p-3 rounded-lg w-fit mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </Motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="container mx-auto px-4">
          <Motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Getting a Bitcoin loan is simple and straightforward with our platform.
            </p>
          </Motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: 1,
                icon: (
                  <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                ),
                title: "Create an Account",
                description: "Sign up and complete the verification process to get started."
              },
              {
                step: 2,
                icon: (
                  <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                title: "Apply for a Loan",
                description: "Submit your loan application with details about your collateral."
              },
              {
                step: 3,
                icon: (
                  <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Receive Funds",
                description: "Once approved, receive your Bitcoin loan directly to your wallet."
              }
            ].map((step, index) => (
              <Motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative"
              >
                <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center relative z-10">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-blue-900 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold border-4 border-gray-800">
                    {step.step}
                  </div>
                  <div className="flex justify-center mb-4 mt-4">
                    <div className="bg-blue-900/20 p-4 rounded-full">
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </div>
                
                {/* Connector line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 left-full w-full h-0.5 bg-gradient-to-r from-blue-500 to-transparent -translate-y-1/2 z-0"></div>
                )}
              </Motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <Motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Clients Say</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Don't just take our word for it. Here's what our clients have to say about their experience.
            </p>
          </Motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Alex Thompson",
                role: "Crypto Investor",
                avatar: "https://randomuser.me/api/portraits/men/32.jpg",
                quote: "Bitcoin Loan Bank made it easy for me to access liquidity without selling my Bitcoin. The process was smooth and the terms were clear.",
                rating: 5
              },
              {
                name: "Sarah Johnson",
                role: "Property Developer",
                avatar: "https://randomuser.me/api/portraits/women/44.jpg",
                quote: "I used my property as collateral to get a Bitcoin loan for a new development project. The rates were competitive and the service was excellent.",
                rating: 5
              },
              {
                name: "Michael Chen",
                role: "Gold Investor",
                avatar: "https://randomuser.me/api/portraits/men/67.jpg",
                quote: "Using my gold as collateral was a seamless process. The loan was approved quickly and the funds were in my wallet within hours.",
                rating: 4
              }
            ].map((testimonial, index) => (
              <Motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-900 rounded-xl p-6 border border-gray-700"
              >
                <div className="flex items-center mb-4">
                  <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <h4 className="text-lg font-semibold text-white">{testimonial.name}</h4>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-500' : 'text-gray-600'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-300 italic">"{testimonial.quote}"</p>
              </Motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section - darker background, brighter text */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-purple-900 opacity-95"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518546305927-5a555bb7020d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center mix-blend-multiply opacity-50"></div>
        <div className="absolute inset-0 bg-black/50"></div>
        
        {/* Bitcoin symbols */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute text-white/10"
              style={{
                fontSize: `${Math.random() * 100 + 50}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            >
              ₿
            </div>
          ))}
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <Motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Ready to Unlock the Value of Your Assets?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Apply for a Bitcoin loan today or use our loan calculator to see how much you can borrow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/borrow"
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Apply for a Loan
              </Link>
              <Link
                to="/simulator"
                className="px-8 py-3 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm border border-white/30"
              >
                Loan Calculator
              </Link>
            </div>
          </Motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
