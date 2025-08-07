import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/helpers';

const PerpetratorList = ({ perpetrators }) => {
  if (perpetrators.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <p className="text-gray-500 text-sm">No perpetrators found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Complaint Count
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Last Incident
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {perpetrators.map((perpetrator, index) => (
            <tr key={index} className="hover:bg-gray-50 transition duration-150">
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm font-medium text-gray-800">{perpetrator._id}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-600">{perpetrator.count}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-600">
                  {formatDate(perpetrator.latestIncident)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Link
                  to={`/hr/complaints?perpetrator=${encodeURIComponent(perpetrator._id)}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Complaints
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PerpetratorList;
