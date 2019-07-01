import { handleActions } from 'redux-actions';
import immutable from 'immutability-helper';
import { parseError } from 'modules/client';

import { ActionTypes, STATUS } from 'constants/index';

export const githubState = {
  repos: {
    data: {},
    status: STATUS.IDLE,
    message: '',
    query: '',
    contributors: [],
    repo_id: '',
  },
  user: {},
  org: {
    name: '',
    location: '',
  },
};

function setContributors(payload) {
  return payload.contributors;
}

export default {
  github: handleActions(
    {
      [ActionTypes.GITHUB_GET_REPOS]: (state, { payload }) =>
        immutable(state, {
          repos: {
            data: {
              [payload.query.org]: { $set: [] },
            },
            message: { $set: '' },
            query: { $set: payload.query },
            status: { $set: STATUS.RUNNING },
          },
        }),
      [ActionTypes.GITHUB_GET_REPOS_SUCCESS]: (state, { payload }) =>
        immutable(state, {
          repos: {
            data: {
              [state.repos.query.org]: { $set: payload.data || [] },
            },
            status: { $set: STATUS.READY },
          },
        }),
      [ActionTypes.GITHUB_GET_REPOS_FAILURE]: (state, { payload }) =>
        immutable(state, {
          repos: {
            message: { $set: parseError(payload.message) },
            status: { $set: STATUS.ERROR },
          },
        }),
      [ActionTypes.GITHUB_GET_CONTRIBUTORS]: state =>
        immutable(state, {
          contributorsFetchStatus: { $set: STATUS.RUNNING },
        }),

      [ActionTypes.GITHUB_GET_CONTRIBUTORS_SUCCESS]: (state, { payload }) =>
        immutable(state, {
          repos: {
            data: {
              [state.repos.query.org]: {
                $set: payload.repos || state.repos.data[state.repos.query.org] || [],
              },
            },
            contributors: { $set: setContributors(payload.data) || [] },
            repo_id: { $set: payload.data.repo_id },
            status: { $set: STATUS.READY },
          },
          contributorsFetchStatus: { $set: STATUS.READY },
        }),
      [ActionTypes.GITHUB_GET_CONTRIBUTORS_FAILURE]: (state, { payload }) =>
        immutable(state, {
          repos: {
            message: { $set: parseError(payload.message) },
            status: { $set: STATUS.ERROR },
          },
        }),
      [ActionTypes.GITHUB_GET_USER]: state =>
        immutable(state, {
          user: { $set: {} },
        }),

      [ActionTypes.GITHUB_GET_USER_SUCCESS]: (state, { payload }) =>
        immutable(state, {
          user: { $set: payload.data } || {},
        }),

      [ActionTypes.GITHUB_GET_USER_FAILURE]: (state, { payload }) =>
        immutable(state, {
          user: {
            error: { $set: parseError(payload.message) },
            status: { $set: STATUS.ERROR },
          },
        }),
    },
    githubState,
  ),
};
