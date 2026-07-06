import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { store } from './store/store';

test('renders application shell', () => {
    render(
        <Provider store={store}>
            <MemoryRouter>
                <App />
            </MemoryRouter>
        </Provider>,
    );

    expect(document.body).toBeTruthy();
});
