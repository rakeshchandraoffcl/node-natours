class APIFeatures {
  constructor(queryForDocument, userQuery) {
    this.queryForDocument = queryForDocument;
    this.userQuery = userQuery;
  }

  filter() {
    const queryObj = { ...this.userQuery };
    // EXCLUDE FIELDS
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    // EXCLUDE FROM QUERY OBJECT
    excludeFields.forEach(field => delete queryObj[field]);
    // CONVERT TO STRING
    // 🧠 WE NEED TO ADD $ WITH THE OPERATOR 🧠
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      match => `$${match}`
    );

    // 🔥 BUILD QUERY OBJECT 🔥
    this.queryForDocument.find(JSON.parse(queryString));
    return this;
  }

  sort() {
    // SORTING
    // 🧠 sort=price [sort price by ascending] | sort=-price [sort price by descending] | sort=price,-rating [if price same then sort by rating descending] 🧠
    if (this.userQuery.sort) {
      const sortString = this.userQuery.sort.split(',').join(' ');
      this.queryForDocument = this.queryForDocument.sort(sortString);
    } else {
      // SHOW NEWEST ONE FIRST
      this.queryForDocument = this.queryForDocument.sort('-createdAt');
    }
    return this;
  }

  limit() {
    // LIMITING
    if (this.userQuery.fields) {
      const fields = this.userQuery.fields.split(',').join(' ');
      this.queryForDocument = this.queryForDocument.select(fields);
    } else {
      this.queryForDocument = this.queryForDocument.select('-__v');
    }
    return this;
  }

  pagination() {
    // PAGINATION
    // eg - page=2&limit=5
    const page = this.userQuery.page * 1 || 1;
    const limit = this.userQuery.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.queryForDocument = this.queryForDocument.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
