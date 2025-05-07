export function buildMongoQuery(node) {
    if (!node || !Array.isArray(node.rules) || node.rules.length === 0) {
      return {}; // no rules → match all
    }
  
    const opsMap = {
      '>': '$gt',
      '<': '$lt',
      '=': '$eq',
      '>=': '$gte',
      '<=': '$lte',
      '!=': '$ne',
      'contains': { $regex: value => new RegExp(escapeRegExp(value), 'i') }
    };
  
    // Helper to safely escape regex special characters
    function escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
  
    // Convert string values to appropriate types
    function convertValue(field, value) {
      if (value === null || value === undefined) return null;
      
      // Field-specific type conversion
      switch (field) {
        case 'spend':
          return Number(value);
        case 'visits':
          return Number(value);
        case 'inactiveDays':
          return Number(value);
        default:
          return value;
      }
    }
  
    function parseNode(n) {
      // Group node
      if (n.combinator && Array.isArray(n.rules)) {
        const clauses = n.rules
          .map(parseNode)
          .filter(Boolean); // Remove null/undefined values
        
        if (clauses.length === 0) return null;
        
        return {
          [n.combinator === 'or' ? '$or' : '$and']: clauses
        };
      }
  
      // Rule node: must have field, operator, and a non-empty value
      const { field, operator, value } = n;
      
      if (!field || !operator || value === undefined || value === '') {
        return null;
      }
  
      const convertedValue = convertValue(field, value);
      
      // Skip if conversion resulted in invalid value
      if (convertedValue === null) return null;
  
      // Special handling for inactiveDays → lastOrderDate
      if (field === 'inactiveDays') {
        const now = new Date();
        const cutoffDate = new Date(now.getTime() - (convertedValue * 24 * 60 * 60 * 1000));
        
        // Reverse the operator for date comparison (e.g., "inactive > 30 days" means "lastOrderDate < cutoff")
        const reversedOps = {
          '>': '$lt',
          '<': '$gt',
          '>=': '$lte',
          '<=': '$gte',
          '=': '$eq',
          '!=': '$ne'
        };
        
        return { lastOrderDate: { [reversedOps[operator] || opsMap[operator]]: cutoffDate } };
      }
  
      // Handle special operators
      if (operator === 'contains') {
        return { [field]: opsMap.contains(convertedValue) };
      }
  
      // Standard comparison
      return { [field]: { [opsMap[operator]]: convertedValue } };
    }
  
    const filter = parseNode(node);
    return filter || {};
  }
  
  // Helper method to validate the query works with your schema
  export function validateQuery(query) {
    const errors = [];
    
    function validateNode(node) {
      // Check group nodes
      if (node.combinator && Array.isArray(node.rules)) {
        if (!['and', 'or'].includes(node.combinator)) {
          errors.push(`Invalid combinator: ${node.combinator}`);
        }
        
        node.rules.forEach(validateNode);
        return;
      }
      
      // Check rule nodes
      const { field, operator, value } = node;
      
      // Missing required fields
      if (!field) errors.push('Missing field in rule');
      if (!operator) errors.push(`Missing operator for field: ${field}`);
      
      // Field validation
      const validFields = ['spend', 'visits', 'inactiveDays'];
      if (!validFields.includes(field)) {
        errors.push(`Unknown field: ${field}`);
      }
      
      // Operator validation
      const validOps = ['>', '<', '=', '>=', '<=', '!='];
      if (!validOps.includes(operator)) {
        errors.push(`Invalid operator ${operator} for field ${field}`);
      }
      
      // Value validation
      if (value === undefined || value === '') {
        errors.push(`Missing value for field: ${field}`);
      } else {
        // Type-specific validation
        if (['spend', 'visits', 'inactiveDays'].includes(field)) {
          const num = Number(value);
          if (isNaN(num)) {
            errors.push(`Invalid numeric value for ${field}: ${value}`);
          }
        }
      }
    }
    
    validateNode(query);
    return errors;
  }
  
  // Additional helper to create MongoDB aggregation pipeline from the query
  export function createAggregationPipeline(query) {
    const filter = buildMongoQuery(query);
    
    return [
      { $match: filter },
      // You can add additional pipeline stages here for analytics
      // such as grouping, sorting, or computing statistics
    ];
  }