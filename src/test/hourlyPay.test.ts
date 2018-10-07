import * as assert from 'assert';
import hourlyPay from '../hourlyRate';

const oneHourInMs = 60 * 60 * 1000;
// Defines a Mocha unit test
suite('hourlyPay', function() {
  const oldTimestamp = Date.now();

  test('0 hour difference', function() {
    const newTimestamp = Date.now();
    const result = hourlyPay(oldTimestamp, newTimestamp, '10 USD');
    assert.equal(result, '0 USD');
  });
  test('half an hour difference', function() {
    const newTimestamp = Date.now() + oneHourInMs / 2;
    const result = hourlyPay(oldTimestamp, newTimestamp, '10 USD');
    assert.equal(result, '5 USD');
  });
  test('1 hour difference', function() {
    const newTimestamp = Date.now() + oneHourInMs;
    const result = hourlyPay(oldTimestamp, newTimestamp, '10 USD');
    assert.equal(result, '10 USD');
  });

  test('2 hours difference', function() {
    const newTimestamp = Date.now() + oneHourInMs * 2;
    const result = hourlyPay(oldTimestamp, newTimestamp, '10 USD');
    assert.equal(result, '20 USD');
  });
  test('200 hours difference', function() {
    const newTimestamp = Date.now() + oneHourInMs * 200;
    const result = hourlyPay(oldTimestamp, newTimestamp, '10 USD');
    assert.equal(result, '2000 USD');
  });
});
