export default {
  bendRef: function (collection, id) {
    return {
      _collection: collection,
      _type: 'BendRef',
      _id: id,
    };
  },

  bendUserRef: function (id) {
    return this.bendRef('user', id);
  },

  bendFileRef: function (id) {
    return {
      _id: id,
      _type: 'BendFile',
    };
  },

  wrapInCallback: function (promise, callback) {
    if (!promise) {
      throw new Error('Promise is required!');
      return;
    }

    promise.then(
      function (response) {
        callback(null, response);
      },

      function (error) {
        callback(error);
      }
    );
  },
};
