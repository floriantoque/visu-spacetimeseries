set nocompatible              " required
filetype off                  " required

" Set the runtime path to include Vundle and initialize
set rtp+=~/.vim/bundle/Vundle.vim
call vundle#begin()

" Alternatively, pass a path where Vundle should install plugins
" call vundle#begin('~/some/path/here')

" Let Vundle manage Vundle, required
Plugin 'gmarik/Vundle.vim'

" Python folding
Plugin 'tmhedberg/SimpylFold'

" Auto-indentation
Plugin 'vim-scripts/indentpython.vim'

" Color Schemes
Plugin 'jnurmine/Zenburn'
Plugin 'altercation/vim-colors-solarized'

" File Browsing
Plugin 'scrooloose/nerdtree'
Plugin 'jistr/vim-nerdtree-tabs'

" Super Searching
Plugin 'kien/ctrlp.vim'

" Git integration
Plugin 'tpope/vim-fugitive'

" Powerline 
Plugin 'Lokaltog/powerline', {'rtp': 'powerline/bindings/vim/'}

" Powerful autocompletion
Plugin 'davidhalter/jedi-vim'

"Auto-Complete
Plugin 'Valloric/YouCompleteMe'

" Nerd Cmmenter
Plugin 'scrooloose/nerdcommenter'

call vundle#end()            " required
filetype plugin indent on    " required



" CONFIGURATION

" Autocomplete javascript
set omnifunc=syntaxcomplete#Complete

" YCM settings
let g:ycm_autoclose_preview_window_after_completion=1
map <leader>g  :YcmCompleter GoToDefinitionElseDeclaration<CR>

"UTF-8 Support
set encoding=utf-8

"Virtualenv Support
"py << EOF
"import os
"import sys
"if 'VIRTUAL_ENV' in os.environ:
"	project_base_dir = os.environ['VIRTUAL_ENV']
"	activate_this = os.path.join(project_base_dir, 'bin/activate_this.py')
"	execfile(activate_this, dict(__file__=activate_this))
"EOF

" Display line numbers
set nu

" Syntax colors
syntax on

" FileType indentation
autocmd FileType yaml setlocal ts=2 sts=2 sw=2 expandtab

" PEP 8 indentation
au BufNewFile,BufRead *.py
    \ set tabstop=4 |
    \ set softtabstop=4 |
    \ set shiftwidth=4 |
    \ set textwidth=79 |
    \ set expandtab |
    \ set autoindent |
    \ set fileformat=unix |

au BufNewFile,BufRead *.js,*.html,*.css
    \ set tabstop=2 |
    \ set softtabstop=2 |
    \ set shiftwidth=2 |

" Search visually selected text
vnoremap <C-r> "hy:%s/<C-r>h//gc<left><left><left>

" Colorization
let g:solarized_termcolors=16
let g:solarized_termtrans = 1
set term=xterm-256color
set background=dark
set t_Co=256
" colorscheme solarized

" Tree node delimiter unknown character
let g:NERDTreeNodeDelimiter = "\u00a0"

" Tree node mirror (open one tree node per tab)
autocmd vimenter * NERDTree
let NERDTreeIgnore=['\.pyc$', '\~$'] "ignore files in NERDTree
nmap <F1> :NERDTreeToggle<CR>:NERDTreeMirror<CR>
autocmd BufWinEnter * NERDTreeMirror

" Enable folding
set foldmethod=indent
set foldlevel=99

" Enable folding with the spacebar
nnoremap <space> za
let g:SimpylFold_docstring_preview=1

" Show hidden files (hide: Shift+ i)
let NERDTreeShowHidden=1


" DRAFT --------------------------------------------
"autocmd StdinReadPre * let s:std_in=1
"autocmd VimEnter * if argc() == 1 && isdirectory(argv()[0]) && !exists("s:std_in") | exe 'NERDTree' argv()[0] | wincmd p | ene | endif

"Flagging Unnecessary Whitespace
"au BufRead,BufNewFile *.py,*.pyw,*.c,*.h match BadWhitespace /\s\+$/

"if has('python3')
"	python3 import sys
"endif

"call togglebg#map("<F5>")
