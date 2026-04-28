from setuptools import setup, find_packages

setup(
    name="ichis",
    version="0.0.1",
    description="Tema visual genérico inspirado no Aura para Frappe/ERPNext v16",
    author="GREENFARMS",
    author_email="contato@greenfarms.com.br",
    packages=find_packages(include=["ichis", "ichis.*"]),
    include_package_data=True,
    zip_safe=False,
)
