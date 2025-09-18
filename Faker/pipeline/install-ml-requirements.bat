@echo off
echo ========================================
echo Installing ML packages in pipeline venv
echo ========================================
echo.

REM Check if venv exists
if not exist "venv\Scripts\python.exe" (
    echo ERROR: Virtual environment not found!
    echo Please run setup.bat first to create the venv.
    pause
    exit /b 1
)

echo Using Python: venv\Scripts\python.exe
echo.

REM Upgrade pip first
echo Upgrading pip...
venv\Scripts\python.exe -m pip install --upgrade pip

echo.
echo Installing ML packages...
venv\Scripts\python.exe -m pip install pandas scikit-learn joblib numpy

echo.
echo Verifying installation...
venv\Scripts\python.exe -c "import pandas; print('✓ pandas', pandas.__version__)"
venv\Scripts\python.exe -c "import sklearn; print('✓ scikit-learn', sklearn.__version__)"
venv\Scripts\python.exe -c "import joblib; print('✓ joblib installed')"
venv\Scripts\python.exe -c "import numpy; print('✓ numpy', numpy.__version__)"

echo.
echo ========================================
echo ✅ ML packages installed successfully!
echo ========================================
echo.
pause