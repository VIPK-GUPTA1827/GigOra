const mongoose = require('mongoose');

/**
 * Runs a transactional database workflow.
 * Guarantees all writes inside work(session) either commit atomically or roll back completely.
 */
async function withTransaction(work) {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
}

module.exports = withTransaction;
