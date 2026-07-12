import React from 'react';
import withStateManager from '../StateWrapper';

/**
 * Example component demonstrating the usage of the StateWrapper
 * This serves as a template for migrating existing components
 * to use the new state management system.
 */
class StatefulComponent extends React.Component {
  componentDidMount() {
    // Example of subscribing to state changes
    this.props.subscribeToState(this.handleStateChange);
    
    // Initialize the component's state
    this.props.setCurrentState({
      status: 'idle',
      data: null
    });
  }

  componentWillUnmount() {
    // Cleanup: unsubscribe from state changes
    this.props.unsubscribeFromState(this.handleStateChange);
  }

  handleStateChange = (newState) => {
    console.log('State changed:', newState);
  };

  handleAction = async () => {
    // Example of state transition
    this.props.setDesiredState({
      status: 'processing',
      data: null
    });

    try {
      // Simulate some async operation
      const result = await someAsyncOperation();
      
      this.props.setDesiredState({
        status: 'completed',
        data: result
      });
    } catch (error) {
      this.props.setDesiredState({
        status: 'error',
        error: error.message
      });
    }
  };

  render() {
    const { currentState, transitioningState, errorState } = this.props;

    if (!currentState) {
      return <div>Initializing...</div>;
    }

    return (
      <div>
        <h2>Current State: {currentState.status}</h2>
        {transitioningState && <div>State is transitioning...</div>}
        {errorState && <div>Error: {errorState.message}</div>}
        {currentState.data && <div>Data: {JSON.stringify(currentState.data)}</div>}
        <button onClick={this.handleAction} disabled={transitioningState}>
          Perform Action
        </button>
      </div>
    );
  }
}

// Mock async operation for the example
const someAsyncOperation = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ message: 'Operation completed successfully' });
    }, 1000);
  });
};

// Wrap the component with the state manager
export default withStateManager(StatefulComponent);