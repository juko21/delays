import { render } from '@testing-library/react-native';
import Stock from '../../components/Stock';
import StockLst from '../../components/Stock';
import { useState, useEffect } from 'react';

jest.mock("../../components/StockList", () => "StockList");

test('header should exist containing text Lagerförteckning', async () => {

    const { getByText, debug } = render(<Stock />);

    debug("Stock component");

    const header = await getByText('LAGERFÖRTECKNING');

    expect(header).toBeDefined();
});