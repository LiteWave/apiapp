"""
deploy apiapp to servers

install fabric: sudo pip install Fabric
deploy to prod: fab deploy_prod:master
"""
from fabric.api import env, cd, run, execute, task, sudo
from fabric import colors
from fabric.decorators import roles, runs_once
from fabric.contrib.files import exists

#setup defaults
env.forward_agent = True
env['user'] = 'ubuntu'

@task
def deploy_prod_host(branch,host):
    """
    deploy branch of apiapp to specified host
    """
    hosts = [
        host
    ]
    env['branch'] = branch
    env['environment'] = 'production'
    execute(deploy, hosts=hosts)

@task
def deploy_prod(branch):
    """
    deploy apiapp to production
    """
    hosts = [
        '52.10.194.211', #web1,
        '52.35.105.39', #web2
        '52.24.246.109' #web3
    ]
    env['branch'] = branch
    env['environment'] = 'production'
    execute(deploy, hosts=hosts)

@task
def deploy_stage(branch):
    """
    deploy apiapp to staging
    """
    hosts = [
        '52.35.158.241', #webmini,
    ]
    env['branch'] = branch
    env['environment'] = 'production'
    execute(deploy, hosts=hosts)

def deploy():
    """
    deploy apiapp to various environments
    """
    env['repo'] = '/home/ubuntu/apps/apiapp'

    #checkout branch
    print colors.cyan('checking out apiapp...')
    with cd(env['repo']):
        run('git fetch --all --tags')
        run('git add -A')
        run('git stash')
        run('git checkout %s' % env['branch'])
        run('git pull origin %s' % env['branch'])
        
        print colors.cyan('installing node dependencies...')
        run('./install.sh')

        print colors.cyan('restarting apiapp...')
        run('./run.sh')
        
        print colors.cyan('deploy complete.')
