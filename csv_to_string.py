import pandas as pd
import openpyxl
from typing import Dict, Any

def excel_to_cell_dict(file_path: str, sheet_name: str = None) -> Dict[str, Any]:
    """
    Loads an Excel file and converts the contents to a dictionary mapping cell locations to values.
    
    Args:
        file_path: Path to the Excel file
        sheet_name: Name of sheet to read. If None, reads first sheet.
    
    Returns:
        Dictionary mapping cell references (e.g. 'A1') to cell values
    """
    # Load workbook
    wb = openpyxl.load_workbook(file_path, data_only=True)
    
    # Get sheet
    if sheet_name == None:
        sheet = wb.active
    else:
        sheet = wb[sheet_name]
        
    # Create dictionary to store cell values
    cell_dict = {}
    
    # Iterate through all cells that contain data
    for row in sheet.iter_rows():
        for cell in row:
            if cell.value is not None:  # Only include non-empty cells
                cell_dict[cell.coordinate] = cell.value
                
    return cell_dict

d = excel_to_cell_dict("MSFT_model.xlsx", "MSFT-Model")

# Build output string by iterating through cell locations in order
output = "{"
for row in range(1, 56):  # 1 to 205
    for col in range(0, 52):  # A to AZ
        # Convert column number to letter(s)
        if col < 26:
            col_letter = chr(65 + col)  # A-Z
        else:
            col_letter = 'A' + chr(65 + (col - 26))  # AA-AZ
            
        cell = f"{col_letter}{row}"
        if cell in d:
            output += f"'{cell}':'{d[cell]}', "
output = output[:-2] + "}"

with open('output.txt', 'w') as f:
    f.write(output)