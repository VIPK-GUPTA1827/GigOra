const request = require('supertest');
const app = require('../app');
const Gig = require('../models/Gig');
const { makeUser } = require('./helpers');

describe('Gigs Pagination and Sorting Guard (GET /api/gigs)', () => {
  let clientUser;

  beforeEach(async () => {
    const created = await makeUser({ role: 'client' });
    clientUser = created.user;

    // Seed 25 open gigs with varying budgets and timestamps
    const gigsToInsert = [];
    for (let i = 1; i <= 25; i++) {
      gigsToInsert.push({
        title: `Test Project Pagination ${i}`,
        description: `This is a valid long description for pagination test project number ${i}.`,
        category: 'Web Development',
        budget: i * 1000,
        client: clientUser._id,
        status: 'open',
        createdAt: new Date(Date.now() - (26 - i) * 10000)
      });
    }
    await Gig.insertMany(gigsToInsert);
  });

  it('default limit is 20 when limit parameter is omitted', async () => {
    const res = await request(app).get('/api/gigs');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(20);
    expect(res.body.page).toBe(1);
    expect(res.body.totalPages).toBe(2);
  });

  it('max limit is capped at 50 even if limit=1000 is requested', async () => {
    const res = await request(app).get('/api/gigs?limit=1000');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(50);
  });

  it('sort=newest returns projects ordered by createdAt descending', async () => {
    const res = await request(app).get('/api/gigs?sort=newest&limit=5');
    expect(res.status).toBe(200);
    const data = res.body.data;
    expect(data.length).toBe(5);
    for (let i = 0; i < data.length - 1; i++) {
      const current = new Date(data[i].createdAt).getTime();
      const next = new Date(data[i + 1].createdAt).getTime();
      expect(current).toBeGreaterThanOrEqual(next);
    }
  });

  it('sort=budget_asc and sort=budget_desc order projects correctly', async () => {
    const ascRes = await request(app).get('/api/gigs?sort=budget_asc&limit=5');
    expect(ascRes.status).toBe(200);
    const ascData = ascRes.body.data;
    expect(ascData.length).toBe(5);
    for (let i = 0; i < ascData.length - 1; i++) {
      expect(ascData[i].budget).toBeLessThanOrEqual(ascData[i + 1].budget);
    }

    const descRes = await request(app).get('/api/gigs?sort=budget_desc&limit=5');
    expect(descRes.status).toBe(200);
    const descData = descRes.body.data;
    expect(descData.length).toBe(5);
    for (let i = 0; i < descData.length - 1; i++) {
      expect(descData[i].budget).toBeGreaterThanOrEqual(descData[i + 1].budget);
    }
  });

  it('page calculation returns correct totalPages and count for page 2', async () => {
    const res = await request(app).get('/api/gigs?page=2&limit=20');
    expect(res.status).toBe(200);
    expect(res.body.page).toBe(2);
    expect(res.body.count).toBe(5);
    expect(res.body.totalCount).toBe(25);
  });
});
