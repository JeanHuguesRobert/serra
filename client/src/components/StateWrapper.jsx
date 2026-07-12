import React from 'react';
import { ActiveStateManager } from '../../../core/src/utils/ActiveStateManager';
import PropTypes from 'prop-types';

/**
 * A higher-order component that integrates the ActiveStateManager pattern
 * for standardized state management across components.
 *
 * @param {React.ComponentType} WrappedComponent - The component to wrap with state management
 * @returns {React.ComponentType} - The wrapped component with state management capabilities
 */
const withStateManager = (WrappedComponent) => {
  class StateWrapper extends React.Component {
    static propTypes = {
      initialState: PropTypes.any,
      onStateChange: PropTypes.func,
      onError: PropTypes.func,
      validateTransition: PropTypes.func
    };
    constructor(props) {
      super(props);
      this.stateManager = new ActiveStateManager(props.initialState);
      this.state = {
        currentState: this.stateManager.getCurrentState(),
        desiredState: null,
        transitioningState: false,
        errorState: null,
        stateHistory: []
      };
    }

    componentDidMount() {
      this.unsubscribe = this.stateManager.subscribe(this.handleStateUpdate);
    }

    componentWillUnmount() {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
    }

    handleStateUpdate = (stateUpdate) => {
      this.setState({
        currentState: stateUpdate.current,
        desiredState: stateUpdate.desired,
        transitioningState: stateUpdate.transitioning,
        errorState: stateUpdate.error,
        stateHistory: stateUpdate.history
      });

      if (this.props.onStateChange) {
        this.props.onStateChange(stateUpdate);
      }

      if (stateUpdate.error && this.props.onError) {
        this.props.onError(stateUpdate.error);
      }
    }

    setDesiredState = (newState) => {
      const { validateTransition } = this.props;
      
      if (validateTransition) {
        const isValid = validateTransition(this.state.currentState, newState);
        if (!isValid) {
          const error = new Error('Invalid state transition');
          this.handleError(error);
          return false;
        }
      }
      
      return this.stateManager.setDesiredState(newState);
    }

    completeTransition = () => {
      return this.stateManager.completeTransition();
    }

    clearErrorState = () => {
      this.stateManager.clearErrorState();
    }

    handleError = (error) => {
      const { onError } = this.props;
      if (onError) {
        onError(error);
      }
    }

    render() {
      const { initialState, onStateChange, onError, ...rest } = this.props;
      return (
        <WrappedComponent
          {...rest}
          currentState={this.state.currentState}
          desiredState={this.state.desiredState}
          transitioningState={this.state.transitioningState}
          errorState={this.state.errorState}
          stateHistory={this.state.stateHistory}
          setDesiredState={this.setDesiredState}
          completeTransition={this.completeTransition}
          clearErrorState={this.clearErrorState}
        />
      );
    }
  };
};

// Export the HOC as StateWrapper for direct import
export { withStateManager as StateWrapper };
export default withStateManager;