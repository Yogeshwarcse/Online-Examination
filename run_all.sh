#!/usr/bin/env bash
set -e
# Start backend and frontend. Run each in separate terminal or use this script to run in background.
echo "Installing backend dependencies..."
cd backend
npm install
echo "Starting backend on http://localhost:5000"
npm run dev &

cd ../frontend
echo "Installing frontend dependencies..."
npm install
echo "Starting frontend on http://localhost:5173"
npm run dev &

wait
