import React, { useState } from 'react';
import { FileImage, Trash2, ChevronDown, ChevronUp, Filter, Download, ExternalLink } from 'lucide-react';
import { useWasteData } from '../../context/WasteDataContext';
import { generatePDF } from '../../utils/pdfGenerator';
import { Link } from 'react-router-dom';

const RecentClassifications: React.FC = () => {
  const { recentClassifications } = useWasteData();
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const itemsPerPage = 5;

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'recyclable':
        return 'bg-green-100 text-green-800';
      case 'biodegradable':
        return 'bg-yellow-100 text-yellow-800';
      case 'non-recyclable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const sortedClassifications = [...recentClassifications].sort((a, b) => {
    if (sortBy === 'date') {
      return sortAsc 
        ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    } else if (sortBy === 'accuracy') {
      return sortAsc ? a.accuracy - b.accuracy : b.accuracy - a.accuracy;
    } else if (sortBy === 'category') {
      return sortAsc 
        ? a.category.localeCompare(b.category)
        : b.category.localeCompare(a.category);
    }
    return 0;
  });

  const paginatedClassifications = sortedClassifications.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(sortedClassifications.length / itemsPerPage);

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(key);
      setSortAsc(true);
    }
  };

  const handleDownloadPDF = () => {
    generatePDF(sortedClassifications);
  };

  const handleDownloadItem = (item: any) => {
    generatePDF([item], `classification-${item.id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">Recent Classifications</h2>
        <div className="flex space-x-2">
          <button className="p-1 rounded text-gray-500 hover:bg-gray-100">
            <Filter size={18} />
          </button>
          <button 
            onClick={handleDownloadPDF}
            className="p-1 rounded text-gray-500 hover:bg-gray-100 flex items-center"
            title="Download all as PDF"
          >
            <Download size={18} />
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center">
                  Date
                  {sortBy === 'date' && (
                    sortAsc ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  )}
                </div>
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th 
                scope="col" 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center">
                  Category
                  {sortBy === 'category' && (
                    sortAsc ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('accuracy')}
              >
                <div className="flex items-center">
                  Accuracy
                  {sortBy === 'accuracy' && (
                    sortAsc ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  )}
                </div>
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedClassifications.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {new Date(item.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Link to={`/classification/${item.id}`} className="block">
                    <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center cursor-pointer">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="Waste" className="h-10 w-10 rounded-md object-cover" />
                    ) : (
                      <FileImage size={20} className="text-gray-400" />
                    )}
                  </div>
                  </Link>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${item.accuracy}%` }}
                      ></div>
                    </div>
                    <span>{item.accuracy}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <div className="flex space-x-2">
                    <Link 
                      to={`/classification/${item.id}`}
                      className="text-blue-600 hover:text-blue-800"
                      title="View details"
                    >
                      <ExternalLink size={16} />
                    </Link>
                    <button 
                      onClick={() => handleDownloadItem(item)}
                      className="text-green-600 hover:text-green-800"
                      title="Download as PDF"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(page - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(page * itemsPerPage, sortedClassifications.length)}
                </span>{' '}
                of <span className="font-medium">{sortedClassifications.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronDown className="h-5 w-5 rotate-90" />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === i + 1
                        ? 'z-10 bg-green-50 border-green-500 text-green-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Next</span>
                  <ChevronDown className="h-5 w-5 -rotate-90" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentClassifications;