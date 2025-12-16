export default function Home() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">DPWH Unit Price Analysis & Estimating System</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Welcome</h2>
        <p className="text-gray-700 mb-4">
          This application helps you create and manage Unit Price Analysis (UPA) items and generate 
          detailed cost estimates for Bill of Quantities (BOQ).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-green-400">
          <h3 className="text-lg font-semibold mb-3">🏗️ Projects (NEW)</h3>
          <p className="text-gray-600 mb-4">
            Manage construction projects with location-based BOQ. Templates are automatically instantiated with location-specific rates.
          </p>
          <a href="/projects" className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            View Projects
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-3">📋 DUPA Templates</h3>
          <p className="text-gray-600 mb-4">
            Reusable DUPA templates without location-specific rates. Create once, use across all projects.
          </p>
          <a href="/dupa-templates" className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Manage Templates
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-3">👷 DOLE Labor Rates</h3>
          <p className="text-gray-600 mb-4">
            Manage location-based labor rates per DOLE standards. Rates automatically apply based on project location.
          </p>
          <a href="/master/labor" className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
            View Labor Rates
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-3">🚜 Equipment Database</h3>
          <p className="text-gray-600 mb-4">
            Manage construction equipment with rental rates. Import from CSV and use across all DUPA forms.
          </p>
          <a href="/equipment" className="inline-block bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
            View Equipment
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-3">📝 Rate Items (Legacy)</h3>
          <p className="text-gray-600 mb-4">
            Legacy DUPA management with embedded rates. Will be migrated to new template system.
          </p>
          <a href="/rates" className="inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
            View Legacy
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-3">📊 Estimates (Legacy)</h3>
          <p className="text-gray-600 mb-4">
            Browse legacy estimates and generate DPWH reports. Use Projects for new work.
          </p>
          <a href="/estimate" className="inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
            View Estimates
          </a>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-6">
        <h4 className="font-semibold mb-2">Key Features:</h4>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>Comprehensive UPA editor with dynamic rows for labor, equipment, and materials</li>
          <li>Automatic calculation of direct costs and add-ons (OCM, CP, VAT)</li>
          <li>BOQ import with automatic pricing using stored rate items</li>
          <li>Detailed breakdowns showing submitted vs. evaluated costs</li>
          <li>Export estimates with complete cost analysis</li>
        </ul>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-6">
        <h4 className="font-semibold mb-2">⚠️ Setup Required:</h4>
        <p className="text-gray-700">
          Before using this application, ensure MongoDB is running and the connection string 
          is configured in <code className="bg-gray-200 px-2 py-1 rounded">.env.local</code>
        </p>
      </div>
    </div>
  );
}
