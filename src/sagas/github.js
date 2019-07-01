/**
 * @module Sagas/GitHub
 * @desc GitHub
 */

import { all, call, put, takeLatest } from 'redux-saga/effects';
import { requestDev } from 'modules/client';
import { ActionTypes } from 'constants/index';

function first(array) {
  if (array == null) return undefined;
  return array[0];
}

/**
 * Get Repos
 *
 * @param {Object} action
 *
 */
export function* getRepos({ payload }) {
  try {
    const { query } = payload;
    const { org } = query;
    const repo = query.hash ? query.hash.substring(1) : undefined;

    const repos = yield call(requestDev, `https://api.github.com/orgs/${org}/repos`);

    const repoPath = repo ? `${org}/${repo}` : first(repos).full_name;
    const repoName = repo || first(repos).name;
    const contributors = yield call(
      requestDev,
      `https://api.github.com/repos/${repoPath}/contributors`,
    );

    yield put({
      type: ActionTypes.GITHUB_GET_CONTRIBUTORS_SUCCESS,
      payload: { data: { repo_id: repoName, contributors }, repos },
    });
  } catch (err) {
    /* istanbul ignore next */
    yield put({
      type: ActionTypes.GITHUB_GET_REPOS_FAILURE,
      payload: err,
    });
  }
}

export function* getContributors({ payload }) {
  try {
    const response = yield call(
      requestDev,
      `https://api.github.com/repos/${payload.query.full_name}/contributors`,
    );

    const repoContributors = {
      repo_id: payload.query.name,
      contributors: response,
    };

    yield put({
      type: ActionTypes.GITHUB_GET_CONTRIBUTORS_SUCCESS,
      payload: { data: repoContributors },
    });
  } catch (err) {
    /* istanbul ignore next */
    yield put({
      type: ActionTypes.GITHUB_GET_CONTRIBUTORS_FAILURE,
      payload: err,
    });
  }
}

export function* getUser({ payload }) {
  try {
    const response = yield call(requestDev, `https://api.github.com/users/${payload.query}`);

    yield put({
      type: ActionTypes.GITHUB_GET_USER_SUCCESS,
      payload: { data: response },
    });
  } catch (err) {
    /* istanbul ignore next */
    yield put({
      type: ActionTypes.GITHUB_GET_USER_FAILURE,
      payload: err,
    });
  }
}

/**
 * Get Org
 *
 * @param {Object} action
 *
 */
export function* getOrg({ payload }) {
  try {
    const response = yield call(requestDev, `https://api.github.com/orgs/${payload.query}`);
    yield put({
      type: ActionTypes.GITHUB_GET_ORG_SUCCESS,
      payload: { data: response },
    });
  } catch (err) {
    /* istanbul ignore next */
    yield put({
      type: ActionTypes.GITHUB_GET_ORG_FAILURE,
      payload: err,
    });
  }
}

/**
 * GitHub Sagas
 */
export default function* root() {
  yield all([
    takeLatest(ActionTypes.GITHUB_GET_REPOS, getRepos),
    takeLatest(ActionTypes.GITHUB_GET_CONTRIBUTORS, getContributors),
    takeLatest(ActionTypes.GITHUB_GET_USER, getUser),
    takeLatest(ActionTypes.GITHUB_GET_ORG, getOrg),
  ]);
}
