// @flow
/**
 * @module Actions/User
 * @desc User Actions
 */
import { createActions } from 'redux-actions';

import { ActionTypes } from 'constants/index';

export const { githubGetRepos: getRepos } = createActions({
  [ActionTypes.GITHUB_GET_REPOS]: (query: string) => ({ query }),
});

export const { githubGetContributors: getContributors } = createActions({
  [ActionTypes.GITHUB_GET_CONTRIBUTORS]: (query: string) => ({ query }),
});

export const { githubGetUser: getUser } = createActions({
  [ActionTypes.GITHUB_GET_USER]: (query: string) => ({ query }),
});

export const { githubOrg: getOrg } = createActions({
  [ActionTypes.GITHUB_GET_ORG]: (query: string) => ({ query }),
});
