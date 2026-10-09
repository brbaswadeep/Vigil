import React from 'react';

const AboutPage = () => {
  return (
    <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto">
      <div className="flex justify-between items-center shrink-0">
        <h2 className="text-2xl text-primary font-medium tracking-wide">About Vigil</h2>
      </div>

      <div className="bg-panel border border-border rounded-lg p-8 w-full max-w-3xl flex flex-col gap-6">
        <p className="text-primary leading-relaxed">
          Vigil is a bridge watchdog and response-policy simulator. It catches real bridge attacks with explainable rules, scores each alert, and evaluates which automated response policies would have saved the most money without excessively blocking legitimate users.
        </p>

        <section>
          <h3 className="text-lg font-semibold text-secondary uppercase tracking-wider mb-4">What we improve</h3>
          <table className="w-full text-left text-sm border-collapse border border-border">
            <thead className="bg-dark text-secondary">
              <tr>
                <th className="p-3 border border-border">Feature</th>
                <th className="p-3 border border-border">State of the Art</th>
                <th className="p-3 border border-border">Vigil</th>
              </tr>
            </thead>
            <tbody className="text-primary">
              <tr>
                <td className="p-3 border border-border font-medium">Explainability</td>
                <td className="p-3 border border-border text-tertiary">Black box</td>
                <td className="p-3 border border-border text-safe">Fully traceable</td>
              </tr>
              <tr>
                <td className="p-3 border border-border font-medium">Evaluation</td>
                <td className="p-3 border border-border text-tertiary">Offline papers</td>
                <td className="p-3 border border-border text-safe">Live replay simulator</td>
              </tr>
              <tr>
                <td className="p-3 border border-border font-medium">Response Policy</td>
                <td className="p-3 border border-border text-tertiary">Left to human</td>
                <td className="p-3 border border-border text-safe">Simulated impact tradeoffs</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="mt-4">
          <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-2">Credits & Inspiration</h3>
          <p className="text-tertiary text-sm">
            Inspired by XChainWatcher, Wormhole's Governor, and Chainlink CCIP rate limits.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
