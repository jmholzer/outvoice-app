function calculateTotal(rowData) {
    var result = 0;
    for (let row of rowData) {
        result += row.cost_per_item * row.count 
    }
    return result;
}

export { calculateTotal }