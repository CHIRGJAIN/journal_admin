const applyBaseSchemaOptions = (schema) => {
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
      if (ret._id) {
        ret.id = ret._id.toString();
        delete ret._id;
      }
    },
  });

  schema.set('toObject', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
      if (ret._id) {
        ret.id = ret._id.toString();
        delete ret._id;
      }
    },
  });
};

module.exports = { applyBaseSchemaOptions };
