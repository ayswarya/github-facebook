import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import treeChanges from 'tree-changes';
import { appColor } from 'modules/theme';

import { getRepos, getContributors, getUser, showAlert } from 'actions/index';
import { STATUS } from 'constants/index';
import './hover.css';
import { Heading, Link, Image, theme, utils } from 'styled-minimal';
import Loader from 'components/Loader';

const { responsive, spacer } = utils;
const { grays } = theme;

const Sidebar = styled.div`
  display: table-cell;
  height: 100%; /* Full-height: remove this if you want "auto" height */
  width: 25%; /* Set the width of the sidebar */
  position: fixed; /* Fixed Sidebar (stay in place on scroll) */
  /* z-index: 1; /* Stay on top */
  /* top: 0; /* Stay at the top */
  *//* left: 0; */
  overflow: scroll;
  background-color: white;
`;

const supportedOrgs = ['facebook']

const OuterContainer = styled.div`
  display: table;
  width: 100%;
  height: 100%;
  padding: 50px;
  position: absolute;
  background-color: #f6f8fa;
`;

const Content = styled.div`
  display: table-cell;
  width: 75%;
  height: 100%;
  vertical-align: top;
`;

const GitHubGrid = styled.ul`
  display: grid;
  grid-auto-flow: row;
  grid-gap: ${spacer(2)};
  grid-template-columns: 100%;
  list-style: none;
  margin: ${spacer(4)} auto 0;
  padding: 0;
  /* stylelint-disable */
  ${/* istanbul ignore next */ p =>
    responsive({
      ix: `
        grid-gap: ${spacer(3)(p)};
        width: 90%;
      `,
      md: `
        grid-template-columns: repeat(2, 1fr);
        width: 100%;
      `,
      lg: `
        grid-template-columns: repeat(3, 1fr);
      `,
      xl: `
        grid-gap: ${spacer(4)(p)};
        grid-template-columns: repeat(4, 1fr);
      `,
    })};
  /* stylelint-enable */

  > li {
    display: flex;
  }
`;

const Item = styled(Link)`
  align-items: center;
  border: solid 0.1rem ${appColor};
  border-radius: 0.4rem;
  height: 300px;
  text-align: center;
  width: 100%;

  p {
    color: #000;
  }

  img {
    /* height: 8rem; */
    height: 300px;
    margin-bottom: ${spacer(2)};
  }
`;

const ItemHeader = styled.div`
  margin-bottom: ${spacer(3)};

  small {
    color: ${grays.gray60};
  }
`;
export class GitHub extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    github: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const { match } = this.props;
    this.setSelectedRepo();
    dispatch(getRepos({ org: match.params.name, hash: window.location.hash }));
  }

  componentWillReceiveProps(nextProps) {
    const { dispatch } = this.props;
    const { changedTo } = treeChanges(this.props, nextProps);

    if (changedTo('github.repos.status', STATUS.ERROR)) {
      dispatch(showAlert(nextProps.github.repos.message, { variant: 'danger' }));
    }
  }

  setSelectedRepo() {
    const { hash } = window.location;
    this.selected = hash ? hash.substring(1) : '';
  }

  getOwnerUrl = repos => repos[0].owner.avatar_url;

  getOwnerName = repos => repos[0].owner.login;

  getContributors = contributor => {
    const { dispatch } = this.props;
    const { history } = this.props;
    const { name } = contributor;
    history.push(`#${name}`);
    this.setSelectedRepo();
    dispatch(getContributors(contributor));
  };

  getRepoDesc = (repos, name) => {
    const selectedRepo = repos.find(repo => repo.name === name);
    if (selectedRepo) {
      return selectedRepo.description;
    }
    return '';
  };

  showOverLay = user => {
    const { dispatch } = this.props;
    dispatch(getUser(user));
  };

  getRepoName = (repos, name) => {
    const selectedRepo = repos.find(repo => repo.name === name);
    if (selectedRepo) {
      return selectedRepo.name;
    }
    return '';
  };

  render() {
    const { github } = this.props;
    const { match } = this.props;
    const orgName = match.params.name;
    const data = github.repos.data[orgName] || [];
    let output;
    if (github.repos.status === STATUS.READY) {
      if (data.length) {
        output = (
          <OuterContainer>
            <Sidebar className="sidenav">
              <ul data-type={orgName} style={{ listStyle: 'none', padding: 0 }}>
              {supportedOrgs.indexOf(orgName) !== -1 && <Image
                style={{ width: '100%', height: 'auto' }}
                src={`${process.env.PUBLIC_URL}/media/icons/${orgName}.svg`}
                alt={this.getOwnerName(github.repos.data[orgName])}
              />}
                {github.repos.data[orgName].map(d => (
                  <li key={d.id} style={{ cursor: 'pointer' }}>
                    <a
                      onClick={() => this.getContributors(d)}
                      className={this.selected === `${d.name}` ? 'selected' : ''}
                      target="_blank"
                    >
                      <ItemHeader>
                        <Heading as="h5" lineHeight={1}>
                          <span style={{ color: '#256eb9' }}>{d.name}</span>
                        </Heading>
                      </ItemHeader>
                    </a>
                  </li>
                ))}
              </ul>
            </Sidebar>
            <Content className="main" style={{ verticalAlign: 'middle' }}>
              {github.contributorsFetchStatus === 'running' && <Loader block />}
              {github.contributorsFetchStatus === 'ready' && (
                <GitHubGrid data-type={orgName} data-testid="GitHubGrid">
                  <p>
                    <Heading as="h3" lineHeight={2}>
                      {this.getRepoName(github.repos.data[orgName], github.repos.repo_id)}
                    </Heading>
                    <br />
                    <span as="h6">
                      {this.getRepoDesc(github.repos.data[orgName], github.repos.repo_id)}
                    </span>
                  </p>

                  {github.repos.contributors &&
                    github.repos.contributors.map(contributor => (
                      <li
                        className="item"
                        key={contributor.id}
                        onMouseEnter={() => this.showOverLay(contributor.login)}
                      >
                        <Item href={contributor.url} target="_blank">
                          <img src={contributor.avatar_url} alt={contributor.login} />
                        </Item>
                        <Item
                          className="overlay content"
                          href="#"
                          style={{
                            paddingTop: '0px',
                            paddingBottom: '0px',
                            paddingLeft: '10px',
                            paddingRight: '10px',
                          }}
                        >
                          <p style={{ textAlign: 'left' }}>
                            {github.user.name && <b>{github.user.name}&ensp;|&ensp;</b>}
                            <span>{contributor.login}</span>
                            <br />
                            <div style={{wordWrap: 'break-word'}}>{github.user.bio}</div>
                          </p>
                          <div style={{ width: '100%', overflow: 'auto' }}>
                            <div style={{ float: 'left', width: '33%' }}>
                              Followers
                              <p style={{ textAlign: 'center' }}>{github.user.followers}</p>
                            </div>
                            <div style={{ float: 'right', width: '34%' }}>
                              Repos
                              <p style={{ textAlign: 'center' }}>{github.user.public_repos}</p>
                            </div>
                            <div style={{ width: '33%', float: 'right' }}>
                              Following
                              <p style={{ textAlign: 'center' }}>{github.user.following}</p>
                            </div>
                          </div>
                          <div style={{ position: 'absolute', bottom: 0, left: 0 }}>
                            {github.user.location && (
                              <p>
                                <img
                                  src={`${process.env.PUBLIC_URL}/media/icons/location.png`}
                                  style={{
                                    height: '20px',
                                    width: '25px',
                                    verticalAlign: 'middle',
                                    float: 'left',
                                  }}
                                  alt={github.user.location}
                                />

                                <div className="ellipsis">{github.user.location}</div>
                              </p>
                            )}
                            {github.user.blog && (
                              <p>
                                <img
                                  src={`${process.env.PUBLIC_URL}/media/icons/blog.png`}
                                  style={{
                                    height: '20px',
                                    width: '25px',
                                    verticalAlign: 'middle',
                                    float: 'left',
                                  }}
                                  alt={github.user.blog}
                                />
                                <div className="ellipsis">{github.user.blog}</div>
                              </p>
                            )}
                          </div>
                        </Item>
                      </li>
                    ))}
                </GitHubGrid>
              )}
            </Content>
          </OuterContainer>
        );
      } else {
        output = <h3>Nothing found</h3>;
      }
    } else {
      output = <Loader block />;
    }

    return (
      <div key="GitHub" data-testid="GitHubWrapper">
        {output}
      </div>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state) {
  return { github: state.github };
}

export default connect(mapStateToProps)(GitHub);
