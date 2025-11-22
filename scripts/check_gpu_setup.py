"""Quick script to check GPU setup for training"""
import torch
import sys

print("=" * 60)
print("GPU Setup Check")
print("=" * 60)

print(f"\nPyTorch Version: {torch.__version__}")
print(f"CUDA Available: {torch.cuda.is_available()}")

if torch.cuda.is_available():
    print(f"CUDA Version: {torch.version.cuda}")
    print(f"Number of GPUs: {torch.cuda.device_count()}")
    for i in range(torch.cuda.device_count()):
        print(f"\nGPU {i}:")
        print(f"  Name: {torch.cuda.get_device_name(i)}")
        print(f"  Memory: {torch.cuda.get_device_properties(i).total_memory / 1024**3:.2f} GB")
        print(f"  Current Memory Allocated: {torch.cuda.memory_allocated(i) / 1024**3:.2f} GB")
        print(f"  Max Memory Allocated: {torch.cuda.max_memory_allocated(i) / 1024**3:.2f} GB")
    
    # Test GPU computation
    print("\nTesting GPU computation...")
    try:
        x = torch.randn(1000, 1000).cuda()
        y = torch.randn(1000, 1000).cuda()
        z = torch.matmul(x, y)
        print("[OK] GPU computation successful!")
    except Exception as e:
        print(f"[ERROR] GPU computation failed: {e}")
else:
    print("\n[WARNING] CUDA not available. Training will use CPU (much slower).")
    print("Make sure you have:")
    print("  1. NVIDIA GPU with CUDA support")
    print("  2. CUDA toolkit installed")
    print("  3. PyTorch with CUDA support (torch with cuda)")

print("\n" + "=" * 60)





