FROM buildpack-deps:buster

ARG username
ARG python_version
ARG env_name
ARG env_disp_name

ENV CONDA_DIR /opt/conda
ENV PATH $CONDA_DIR/bin:$PATH

RUN apt-get update && \ 
    apt-get install -y libmagic-dev && \
    apt-get install -y htop sudo && \
    apt-get install -y wget git libhdf5-dev g++ graphviz openmpi-bin && \
    apt-get install -y dvipng texlive-latex-extra texlive-fonts-recommended
RUN wget --quiet https://repo.continuum.io/miniconda/Miniconda3-4.6.14-Linux-x86_64.sh
RUN echo "0d6b23895a91294a4924bd685a3a1f48e35a17970a073cd2f684ffe2c31fc4be *Miniconda3-4.6.14-Linux-x86_64.sh" | sha256sum -c - && \
    /bin/bash /Miniconda3-4.6.14-Linux-x86_64.sh -f -b -p $CONDA_DIR && \
    rm Miniconda3-4.6.14-Linux-x86_64.sh
RUN apt-get install -y zsh 

# Python
RUN conda create -yn ${env_name} python=${python_version} pip
RUN    /bin/bash -c "source activate ${env_name}" && \
       /opt/conda/envs/${env_name}/bin/pip install --upgrade pip && \
       /opt/conda/envs/${env_name}/bin/pip install jupyter && \
       /opt/conda/envs/${env_name}/bin/pip install PyYAML && \
       /opt/conda/envs/${env_name}/bin/pip install tqdm==4.28.1 && \
       /opt/conda/envs/${env_name}/bin/pip install -U matplotlib && \
       /opt/conda/envs/${env_name}/bin/pip install seaborn && \
       /opt/conda/envs/${env_name}/bin/pip install colorlover && \
       /opt/conda/envs/${env_name}/bin/pip install wget && \
       /opt/conda/envs/${env_name}/bin/pip install ipython
RUN    /opt/conda/envs/${env_name}/bin/python -m ipykernel install --user --name ${env_name} --display-name "${env_disp_name}" && \ 
       conda clean -yt

## Creation user NB_USER
ENV NB_USER ${username}
ENV NB_UID 1000

RUN useradd -m -s /bin/bash -N -u $NB_UID $NB_USER
## user_name:password
RUN echo "$NB_USER:$NB_USER" | chpasswd && adduser $NB_USER sudo && \
    echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

# Set user and workdir
WORKDIR /home
USER $NB_USER
ENV PYTHONPATH='/home/$NB_USER/:$PYTHONPATH'

# Install vim and oh-my-zsh
RUN git clone https://github.com/robbyrussell/oh-my-zsh.git /home/$NB_USER/.oh-my-zsh && \ 
    git clone https://github.com/VundleVim/Vundle.vim.git /home/$NB_USER/.vim/bundle/Vundle.vim
RUN sudo apt-get update
RUN sudo apt-get install -y vim-gtk
RUN sudo apt-get install tmux

# Add dot files
ADD .zshrc /home/$NB_USER/.zshrc
ADD .vimrc /home/$NB_USER/.vimrc

# Install node and npm
RUN curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash - && \
    sudo apt-get install -y nodejs
# Install cmake
RUN sudo apt install -y build-essential cmake python3-dev

# Install vim plugins
ENV TERM xterm-256color
RUN echo 'set -g default-terminal "screen-256color"' >> ~/.tmux.conf && \
    sudo chown toque /home/toque/.vimrc && \
    vim +PluginInstall +qall >/dev/null && \
    echo 'colorscheme solarized' >> ~/.vimrc
RUN cd ~/.vim/bundle/YouCompleteMe && \
    python3 install.py --clang-completer --ts-completer && \
    cd ~

EXPOSE 8888

CMD ["/bin/zsh"]
