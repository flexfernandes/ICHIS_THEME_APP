from setuptools import setup, find_packages

setup(
    name="ichis_theme_control",
    version="1.0.0",
    description="Central administrativa de identidade visual do ERPNext - GREENFARMS",
    author="GREENFARMS",
    author_email="contato@greenfarms.com.br",
    packages=find_packages(include=["ichis_theme_control", "ichis_theme_control.*"]),
    include_package_data=True,
    zip_safe=False,
)
