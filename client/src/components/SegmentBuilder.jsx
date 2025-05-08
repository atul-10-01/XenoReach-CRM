// client/src/components/SegmentBuilder.jsx
import React, { useState, useEffect } from 'react';
import { QueryBuilder, formatQuery } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';
import axios from 'axios';

// Define API base URL based on environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Operator label map for user-friendly text
const operatorMap = {
  '>': 'is greater than',
  '<': 'is less than',
  '=': 'is equal to',
  '>=': 'is greater than or equal to',
  '<=': 'is less than or equal to',
  '!=': 'is not equal to'
};

const operatorObjects = Object.entries(operatorMap).map(([name, label]) => ({ name, label }));

// Enhanced field definitions with tooltips and better labels
const fields = [
  { 
    name: 'spend', 
    label: 'Total Spend (₹)', 
    inputType: 'number',
    operators: operatorObjects,
    defaultValue: 1000,
    validator: ({ value }) => {
      const n = Number(value);
      return !isNaN(n) && isFinite(n) && n >= 0;
    },
    tooltip: 'Total amount spent by customer in Indian Rupees'
  },
  { 
    name: 'visits', 
    label: 'Number of Visits', 
    inputType: 'number',
    operators: operatorObjects,
    defaultValue: 1,
    validator: ({ value }) => {
      const n = Number(value);
      return !isNaN(n) && isFinite(n) && Number.isInteger(n) && n >= 0;
    },
    tooltip: 'Total number of times the customer visited your store/website'
  },
  { 
    name: 'inactiveDays', 
    label: 'Days Since Last Order', 
    inputType: 'number',
    operators: operatorObjects,
    defaultValue: 30,
    validator: ({ value }) => {
      const n = Number(value);
      return !isNaN(n) && isFinite(n) && Number.isInteger(n) && n >= 0;
    },
    tooltip: 'Number of days since the customer last placed an order'
  },
];

export default function SegmentBuilder({ onSave }) {
  const [query, setQuery] = useState({
    combinator: 'and', 
    rules: [
      { field: 'spend', operator: '>', value: 1000 }
    ]
  });
  const [segmentName, setSegmentName] = useState('');
  const [previewCount, setPreviewCount] = useState(null);
  const [previewResults, setPreviewResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [showHelp, setShowHelp] = useState(false);
  const [savedSegments, setSavedSegments] = useState([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Custom rule factory to ensure new rules have proper default values
  const createRule = (field) => {
    const fieldDef = fields.find(f => f.name === field) || fields[0];
    return {
      field: fieldDef.name,
      operator: fieldDef.operators[0].name, // Always a string
      value: fieldDef.defaultValue || ''
    };
  };

  // Defensive: ensure all operators are strings before sending to backend
  const sanitizeQuery = (q) => {
    function sanitizeNode(node) {
      if (node.rules) {
        return {
          ...node,
          rules: node.rules.map(sanitizeNode),
        };
      } else {
        return {
          ...node,
          operator: typeof node.operator === 'object' ? node.operator.name : node.operator
        };
      }
    }
    return sanitizeNode(q);
  };

  // Validate query whenever it changes
  useEffect(() => {
    validateQuery();
  }, [query]);

  const validateQuery = () => {
    const errors = [];
    
    // Check that at least one complete rule exists
    const hasCompleteRule = query.rules.some(rule => 
      rule.field && rule.operator && rule.value !== undefined && rule.value !== ''
    );
    
    if (!hasCompleteRule) {
      errors.push('Please complete at least one rule');
    }
    
    // Validate individual rules
    query.rules.forEach((rule, index) => {
      if (!rule.rules) { // Only check leaf rules, not groups
        const field = fields.find(f => f.name === rule.field);
        
        if (field?.validator && rule.value !== undefined && rule.value !== '') {
          const isValid = field.validator(rule);
          if (!isValid) {
            errors.push(`Invalid value for ${field.label} in rule #${index + 1}`);
          }
        }
      }
    });
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handlePreview = async () => {
    if (!validateQuery()) {
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      console.log('Sending preview request to:', `${API_BASE_URL}/segments/preview`);
      const { data } = await axios.post(`${API_BASE_URL}/segments/preview`, { rules: sanitizeQuery(query) });
      console.log('Preview response:', data);
      
      setPreviewCount(data.count);
      setPreviewResults(data.sample || []);
    } catch (err) {
      console.error('Preview error:', err);
      setError(
        err.response?.data?.message || 
        `Failed to preview segment: ${err.message}. Make sure your API server is running at ${API_BASE_URL}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!validateQuery()) {
      return;
    }
    
    if (!segmentName.trim()) {
      setError('Please provide a name for this segment');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // POST to backend
      const response = await axios.post(`${API_BASE_URL}/segments`, {
        name: segmentName,
        rules: sanitizeQuery(query)
      });
      if (response.data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        // Call parent's onSave handler if provided (to trigger refresh in CampaignCreator)
        if (onSave) {
          onSave(response.data.segment);
        }
        setSegmentName('');
      } else {
        setError(response.data.message || 'Failed to save segment');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save segment');
    } finally {
      setLoading(false);
    }
  };

  // Custom rendering for the operator selector to make it more intuitive
  const OperatorSelector = (props) => {
    const currentValue = typeof props.value === 'object' ? props.value.name : (props.value || '>');
    return (
      <div className="inline-block min-w-[120px] w-full sm:w-auto">
        <select
          value={currentValue}
          onChange={e => props.handleOnChange(e.target.value)}
          className="border px-2 py-1 rounded bg-white min-w-[120px] w-full sm:w-auto block"
          style={{appearance: 'menulist'}}
        >
          {props.options.map(option => (
            <option key={option.name} value={option.name}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  };

  // Custom value editor for number inputs
  const ValueEditor = (props) => {
    const field = fields.find(f => f.name === props.field);
    const inputType = field?.inputType || 'text';
    const defaultValue = field?.defaultValue || '';

    return (
      <input
        type={inputType}
        value={props.value ?? defaultValue}
        onChange={e => props.handleOnChange(e.target.value)}
        className="border px-2 py-1 rounded bg-white w-full sm:w-32 block"
        placeholder={defaultValue}
      />
    );
  };

  // Custom rendering for field selector with tooltips
  const FieldSelector = (props) => {
    const fieldOptions = props.options || [];
    
    return (
      <div className="relative inline-block w-full sm:w-auto">
        <select
          value={props.value}
          onChange={e => props.handleOnChange(e.target.value)}
          className="border px-2 py-1 rounded bg-white w-full sm:w-auto block"
        >
          {fieldOptions.map(option => (
            <option key={option.name} value={option.name}>
              {option.label}
            </option>
          ))}
        </select>
        {props.value && (
          <div className="inline-block ml-1 text-gray-500 cursor-help group relative">
            <span>ℹ️</span>
            <div className="hidden group-hover:block absolute z-10 bg-gray-800 text-white p-2 rounded text-xs w-60 -left-28 top-6">
              {fields.find(f => f.name === props.value)?.tooltip || 'Field description'}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Function to display human-readable explanation of the segment
  const getSegmentExplanation = (rulesObj = query) => {
    const explainRule = (rule) => {
      if (rule.rules) {
        // This is a group
        const childExplanations = rule.rules.map(explainRule);
        const combinator = rule.combinator === 'and' ? 'ALL' : 'ANY';
        return `(${combinator} of: ${childExplanations.join(', ')})`;
      } else {
        // This is a rule
        const field = fields.find(f => f.name === rule.field);
        const fieldLabel = field ? field.label : rule.field;
        const operatorMap = {
          '>': 'is greater than',
          '<': 'is less than',
          '=': 'is equal to',
          '>=': 'is greater than or equal to',
          '<=': 'is less than or equal to',
          '!=': 'is not equal to'
        };
        const operatorText = operatorMap[rule.operator] || rule.operator;
        return `${fieldLabel} ${operatorText} ${rule.value}`;
      }
    };

    const mainCombinator = rulesObj.combinator === 'and' ? 'ALL' : 'ANY';
    const ruleExplanations = rulesObj.rules.map(explainRule);
    
    return `Customers who match ${mainCombinator} of these conditions: ${ruleExplanations.join(', ')}`;
  };

  return (
    <div className="w-full max-w-full sm:max-w-2xl lg:max-w-3xl mx-auto p-2 sm:p-4 bg-white rounded-2xl shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h2 className="text-lg sm:text-xl font-semibold">Define Audience Segment</h2>
        <button 
          onClick={() => setShowHelp(!showHelp)}
          className="text-blue-500 hover:text-blue-700 text-sm sm:text-base"
        >
          {showHelp ? 'Hide Help' : 'Need Help?'}
        </button>
      </div>
      
      {showHelp && (
        <div className="mb-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="font-semibold text-blue-800 mb-2 text-sm">How to use the Segment Builder</h3>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-blue-800 space-y-2">
            <li>Use <strong>Add Rule</strong> to create conditions for your segment</li>
            <li>Use <strong>Add Group</strong> to create nested conditions with their own AND/OR logic</li>
            <li>AND means customers must match all conditions</li>
            <li>OR means customers must match at least one condition</li>
            <li>Click <strong>Preview Audience</strong> to see how many customers match your criteria</li>
          </ul>
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="segmentName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
          Segment Name
        </label>
        <input
          type="text"
          id="segmentName"
          value={segmentName}
          onChange={(e) => setSegmentName(e.target.value)}
          placeholder="E.g., High Value Customers"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
        />
      </div>
      
      <div className="bg-gray-50 p-2 sm:p-4 rounded-lg mb-4 border border-gray-200 overflow-x-auto">
        <div className="mb-2 text-xs sm:text-sm text-gray-600">
          <strong>Current Logic:</strong> {getSegmentExplanation()}
        </div>
        
        <div className="min-w-[340px] w-full">
          <QueryBuilder
            fields={fields}
            query={query}
            onQueryChange={q => setQuery(sanitizeQuery(q))}
            controlClassnames={{
              queryBuilder: 'p-2 sm:p-4',
              ruleGroup: 'bg-white p-2 sm:p-4 rounded border border-gray-200 my-2',
              rule: 'p-2 border-l-4 border-blue-200 bg-blue-50 my-2 rounded flex flex-col sm:flex-row items-stretch sm:items-center gap-2',
              value: 'border px-2 py-1 rounded bg-white w-full sm:w-auto',
              addGroup: 'bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded border border-blue-200 ml-0 sm:ml-2 w-full sm:w-auto',
              addRule: 'bg-green-50 text-green-600 hover:bg-green-100 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded border border-green-200 ml-0 sm:ml-2 w-full sm:w-auto',
              removeGroup: 'text-red-500 hover:text-red-700 ml-0 sm:ml-2',
              removeRule: 'text-red-500 hover:text-red-700 ml-0 sm:ml-2',
              combinators: 'border px-3 py-1 rounded bg-white font-medium ml-0 sm:ml-2 w-full sm:w-auto',
              fields: 'border px-2 py-1 rounded bg-white w-full sm:w-auto',
              operators: 'border px-2 py-1 rounded bg-white ml-0 sm:ml-2 min-w-[120px] w-full sm:w-auto',
              valueContainer: 'ml-0 sm:ml-2 flex-grow',
            }}
            translations={{
              addGroup: '+ Add Group',
              addRule: '+ Add Rule',
              removeGroup: '×',
              removeRule: '×',
              combinators: {
                and: 'ALL of the following',
                or: 'ANY of the following'
              }
            }}
            showNotToggle={false}
            showCloneButtons={false}
            controlElements={{
              operatorSelector: OperatorSelector,
              fieldSelector: FieldSelector,
              valueEditor: ValueEditor,
              combinatorSelector: props => (
                <div className="inline-flex items-center w-full sm:w-auto">
                  <span className="mr-2 text-xs sm:text-sm font-medium">Match</span>
                  <select
                    value={props.value}
                    onChange={e => props.handleOnChange(e.target.value)}
                    className="border px-3 py-1 rounded bg-white font-medium w-full sm:w-auto"
                  >
                    <option value="and">ALL of the following</option>
                    <option value="or">ANY of the following</option>
                  </select>
                </div>
              ),
            }}
            createRule={createRule}
          />
        </div>
      </div>
      
      {validationErrors.length > 0 && (
        <div className="mb-4 p-2 sm:p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="font-medium text-yellow-800 text-xs sm:text-sm">Please fix the following issues:</p>
          <ul className="mt-1 list-disc pl-5 text-xs sm:text-sm text-yellow-700">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-6">
        <button
          onClick={handlePreview}
          disabled={loading || validationErrors.length > 0}
          className={`w-full sm:w-auto px-4 sm:px-5 py-2 rounded-xl text-white flex items-center justify-center text-xs sm:text-base ${
            loading || validationErrors.length > 0 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Previewing...
            </>
          ) : '👁️ Preview Audience'}
        </button>
        <button
          onClick={handleSave}
          disabled={validationErrors.length > 0 || !segmentName.trim()}
          className={`w-full sm:w-auto px-4 sm:px-5 py-2 rounded-xl text-white text-xs sm:text-base ${
            validationErrors.length > 0 || !segmentName.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          💾 Save Segment
        </button>
      </div>

      {previewCount !== null && !loading && (
        <div className="mt-6 space-y-4">
          <div className="p-3 sm:p-4 bg-blue-50 rounded-lg text-blue-800 border border-blue-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <span className="text-xl sm:text-2xl mr-2">🎯</span>
              <div>
                <p className="font-medium text-xs sm:text-base">Matched customers: <strong>{previewCount.toLocaleString()}</strong></p>
                <p className="text-xs sm:text-sm mt-1">{getSegmentExplanation()}</p>
              </div>
            </div>
          </div>
          
          {previewResults.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
              <div className="p-2 sm:p-3 bg-gray-50 border-b border-gray-200 font-medium flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <span className="text-xs sm:text-base">Sample Customers ({previewResults.length})</span>
                <span className="text-xs text-gray-500">Showing a sample of matching customers</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(previewResults[0]).map(key => (
                        <th 
                          key={key}
                          className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewResults.map((customer, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        {Object.values(customer).map((val, j) => (
                          <td key={j} className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            {typeof val === 'object' && val instanceof Date 
                              ? val.toLocaleString() 
                              : String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg text-red-800 border border-red-200 text-xs sm:text-sm">
          ⚠️ {error}
        </div>
      )}

      {saveSuccess && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white text-green-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg flex items-center space-x-2 border border-green-200 z-50 animate-fade-in text-xs sm:text-base">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span className="font-medium">Segment saved successfully!</span>
        </div>
      )}

      {/* Display saved segments */}
      {savedSegments.length > 0 && (
        <div className="mt-6">
          <h3 className="text-base sm:text-lg font-medium mb-3">Saved Segments</h3>
          <div className="space-y-3">
            {savedSegments.map(segment => (
              <div key={segment.id} className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <h4 className="font-medium text-base sm:text-lg">{segment.name}</h4>
                  <span className="text-xs sm:text-sm text-gray-500">
                    {segment.customerCount.toLocaleString()} customers
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  {getSegmentExplanation(segment.rules)}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Created {segment.createdAt.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}