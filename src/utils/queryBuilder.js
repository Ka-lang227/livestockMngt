class QueryBuilder {
  constructor(query, queryString) {
    this.query = query;
    // Ensure queryString is an object
    this.queryString = queryString || {};
  }

  filter() {
    // 1A) Basic filtering
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // Default sort by date descending
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      // Default: exclude '__v' field
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  // Additional methods can be added here for specific query needs
  populate(field) {
    this.query = this.query.populate(field);
    return this;
  }

  search(field, searchTerm) {
    if (searchTerm) {
      this.query = this.query.find({
        [field]: { $regex: searchTerm, $options: 'i' }
      });
    }
    return this;
  }

  dateRange(field, startDate, endDate) {
    if (startDate || endDate) {
      const dateQuery = {};
      if (startDate) dateQuery.$gte = new Date(startDate);
      if (endDate) dateQuery.$lte = new Date(endDate);
      this.query = this.query.find({ [field]: dateQuery });
    }
    return this;
  }
}

module.exports = QueryBuilder;
