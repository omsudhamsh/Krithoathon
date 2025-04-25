#!/usr/bin/env python
import os
import sys
import subprocess
import time
import threading
import webbrowser
import signal

# Get the project root directory
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
SERVER_DIR = os.path.join(PROJECT_ROOT, 'server')
CLIENT_DIR = os.path.join(PROJECT_ROOT, 'src')

# Colors for terminal output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_header(message):
    print(f"\n{Colors.HEADER}{Colors.BOLD}=== {message} ==={Colors.ENDC}\n")

def print_info(message):
    print(f"{Colors.BLUE}INFO: {message}{Colors.ENDC}")

def print_success(message):
    print(f"{Colors.GREEN}SUCCESS: {message}{Colors.ENDC}")

def print_warning(message):
    print(f"{Colors.YELLOW}WARNING: {message}{Colors.ENDC}")

def print_error(message):
    print(f"{Colors.RED}ERROR: {message}{Colors.ENDC}")

# Check if required directories exist
def check_directories():
    print_header("Checking directories")
    
    if not os.path.exists(SERVER_DIR):
        print_error(f"Server directory not found: {SERVER_DIR}")
        return False
    
    if not os.path.exists(CLIENT_DIR):
        print_error(f"Client directory not found: {CLIENT_DIR}")
        return False
    
    print_success("All required directories found")
    return True

# Check if required Python packages are installed
def check_python_packages():
    print_header("Checking Python dependencies")
    
    required_packages = [
        'flask', 'flask-cors', 'numpy', 'pillow'
    ]
    
    optional_packages = [
        'tensorflow'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print_info(f"Package {package} is installed")
        except ImportError:
            missing_packages.append(package)
            print_warning(f"Package {package} is not installed")
    
    for package in optional_packages:
        try:
            __import__(package.replace('-', '_'))
            print_info(f"Optional package {package} is installed")
        except ImportError:
            print_warning(f"Optional package {package} is not installed (not required for testing)")
    
    if missing_packages:
        print_error("Missing required Python packages")
        install = input("Do you want to install them now? (y/n): ")
        if install.lower() == 'y':
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', *missing_packages])
            print_success("All packages installed successfully")
            return True
        else:
            print_warning("Continuing without installing missing packages")
            return False
    
    print_success("All required Python packages are installed")
    return True

# Start the Flask server
def start_server():
    print_header("Starting Flask server")
    
    os.chdir(SERVER_DIR)
    
    # Create models directory if it doesn't exist
    models_dir = os.path.join(PROJECT_ROOT, 'models')
    if not os.path.exists(models_dir):
        os.makedirs(models_dir)
        print_info(f"Created models directory: {models_dir}")
    
    # Start the Flask server
    server_process = subprocess.Popen(
        [sys.executable, 'app.py'],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        universal_newlines=True,
        bufsize=1
    )
    
    print_info("Flask server is starting...")
    
    # Function to read and print server output
    def monitor_server_output():
        for line in server_process.stdout:
            print(f"[SERVER] {line.strip()}")
    
    # Start a thread to monitor server output
    threading.Thread(target=monitor_server_output, daemon=True).start()
    
    # Wait for the server to start
    time.sleep(2)
    print_success("Flask server started")
    
    return server_process

# Start the React client
def start_client():
    print_header("Starting React client")
    
    os.chdir(CLIENT_DIR)
    
    # Check if npm is installed
    try:
        subprocess.check_output(['npm', '--version'])
    except (subprocess.SubprocessError, FileNotFoundError):
        print_error("npm is not installed or not in PATH")
        print_info("Please install Node.js and npm, then try again")
        return None
    
    # Start the React development server
    client_process = subprocess.Popen(
        ['npm', 'start'],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        universal_newlines=True,
        bufsize=1
    )
    
    print_info("React client is starting...")
    
    # Function to read and print client output
    def monitor_client_output():
        for line in client_process.stdout:
            print(f"[CLIENT] {line.strip()}")
    
    # Start a thread to monitor client output
    threading.Thread(target=monitor_client_output, daemon=True).start()
    
    # Wait for the client to start
    time.sleep(5)
    print_success("React client started")
    
    return client_process

# Open the web browser
def open_browser():
    print_header("Opening web browser")
    
    client_url = "http://localhost:3000"
    print_info(f"Opening {client_url} in default browser")
    
    # Open the client URL in the default browser
    webbrowser.open(client_url)
    
    print_success("Browser opened")

# Main function
def main():
    print_header("Starting Waste Segregation Application")
    
    # Check if required directories exist
    if not check_directories():
        print_error("Required directories not found. Exiting.")
        return
    
    # Check if required Python packages are installed
    if not check_python_packages():
        print_warning("Some required packages are missing. The application may not work correctly.")
    
    # Start the Flask server
    server_process = start_server()
    if not server_process:
        print_error("Failed to start Flask server. Exiting.")
        return
    
    # Start the React client
    client_process = start_client()
    if not client_process:
        print_error("Failed to start React client. Stopping server.")
        server_process.terminate()
        return
    
    # Open the web browser
    open_browser()
    
    print_header("Application started successfully")
    print_info("Press Ctrl+C to stop all processes and exit")
    
    try:
        # Keep the script running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print_header("Stopping application")
        
        # Stop the client process
        print_info("Stopping React client...")
        client_process.terminate()
        
        # Stop the server process
        print_info("Stopping Flask server...")
        server_process.terminate()
        
        print_success("All processes stopped")

if __name__ == "__main__":
    main() 