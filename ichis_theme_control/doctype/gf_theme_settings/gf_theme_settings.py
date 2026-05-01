# Copyright (c) 2024, GREENFARMS and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class GFThemeSettings(Document):
    """
    Doctype Single que armazena todas as configurações de tema visual do ERPNext.

    Campos organizados em seções:
    - Configuração Geral: ativar/desativar, tema ativo, logos
    - Tema Padrão: cores, fontes, tamanhos, grids, botões, campos, cards
    - Tema Black: mesma estrutura com valores escuros
    - Login: configurações específicas da tela de login
    """
    pass
