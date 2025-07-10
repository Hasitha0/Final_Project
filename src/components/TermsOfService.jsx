import React from 'react';
import { MagicCard } from './ui/magic-card';

const TermsOfService = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <MagicCard className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Terms of Service</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="text-gray-300 space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-white mb-3">1. Registration Requirements</h3>
              <p>By registering as a recycling center on EcoTech, you agree to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain valid certification and licensing</li>
                <li>Comply with all environmental regulations</li>
                <li>Process e-waste according to industry standards</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">2. Service Standards</h3>
              <p>As a registered recycling center, you commit to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Maintain professional service standards</li>
                <li>Process collected materials within agreed timeframes</li>
                <li>Provide accurate reporting on recycling activities</li>
                <li>Follow safe handling procedures for e-waste</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">3. Data Privacy</h3>
              <p>We collect and use your information to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Verify your credentials and legitimacy</li>
                <li>Connect you with collection requests</li>
                <li>Maintain records for compliance purposes</li>
                <li>Improve our platform services</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">4. Account Management</h3>
              <p>Your account may be suspended or terminated if:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Registration information is found to be false</li>
                <li>Service standards are not maintained</li>
                <li>Regulatory violations are reported</li>
                <li>Terms of service are violated</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">5. Liability</h3>
              <p>EcoTech acts as a connection platform. Recycling centers are responsible for:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Proper handling and processing of materials</li>
                <li>Compliance with all applicable laws</li>
                <li>Insurance coverage for operations</li>
                <li>Environmental impact of activities</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">6. Contact Information</h3>
              <p>For questions about these terms, contact us at:</p>
              <ul className="list-none mt-2 space-y-1">
                <li>Email: support@ecotech.com</li>
                <li>Phone: +1 (555) 123-4567</li>
              </ul>
            </section>
          </div>

          <div className="flex justify-end mt-8">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Close
            </button>
          </div>
        </MagicCard>
      </div>
    </div>
  );
};

export default TermsOfService; 