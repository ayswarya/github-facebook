import React from 'react';
import PropTypes from 'prop-types';
import { hot } from 'react-hot-loader/root';
import { connect } from 'react-redux';
import { Router, Route } from 'react-router-dom';
import Helmet from 'react-helmet';
import styled, { ThemeProvider } from 'styled-components';

import history from 'modules/history';
import theme from 'modules/theme';

import config from 'config';
import { showAlert } from 'actions/index';
import GitHub from 'containers/GitHub';
import SystemAlerts from 'containers/SystemAlerts';

import GlobalStyles from 'components/GlobalStyles';

const AppWrapper = styled.div`
  display: table;
  width: 100%;
  height: 100%;
`;

export class App extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
  };

  componentWillReceiveProps() {
    const { dispatch } = this.props;
    dispatch(showAlert('Hello! And welcome!', { variant: 'success', icon: 'bell' }));
  }

  render() {
    return (
      <Router history={history}>
        <ThemeProvider theme={theme}>
          <AppWrapper>
            <Helmet
              defer={false}
              htmlAttributes={{ lang: 'pt-br' }}
              encodeSpecialCharacters={true}
              defaultTitle={config.title}
              titleTemplate={`%s | ${config.name}`}
              titleAttributes={{ itemprop: 'name', lang: 'pt-br' }}
            />
            <Route path="/org/:name/projects" render={props => <GitHub {...props} />} />
            <SystemAlerts />
            <GlobalStyles />
          </AppWrapper>
        </ThemeProvider>
      </Router>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state) {
  return {
    user: state.user,
  };
}

export default hot(connect(mapStateToProps)(App));
