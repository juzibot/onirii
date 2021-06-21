#!/bin/bash

#reset first node
echo "Reset first rabbitmq node."
docker exec rabbit-c1 /bin/bash -c 'rabbitmqctl stop_app'
docker exec rabbit-c1 /bin/bash -c 'rabbitmqctl reset'
docker exec rabbit-c1 /bin/bash -c 'rabbitmqctl start_app'

#build cluster
echo "Starting to build rabbitmq cluster with two ram nodes."
docker exec rabbit-c2 /bin/bash -c 'rabbitmqctl stop_app'
docker exec rabbit-c2 /bin/bash -c 'rabbitmqctl reset'
docker exec rabbit-c2 /bin/bash -c 'rabbitmqctl join_cluster --ram rabbit@rabbit-c1'
docker exec rabbit-c2 /bin/bash -c 'rabbitmqctl start_app'

docker exec rabbit-c3 /bin/bash -c 'rabbitmqctl stop_app'
docker exec rabbit-c3 /bin/bash -c 'rabbitmqctl reset'
docker exec rabbit-c3 /bin/bash -c 'rabbitmqctl join_cluster --ram rabbit@rabbit-c1'
docker exec rabbit-c3 /bin/bash -c 'rabbitmqctl start_app'

#check cluster status
echo "Check cluster status:"
docker exec rabbit-c1 /bin/bash -c 'rabbitmqctl cluster_status'
docker exec rabbit-c2 /bin/bash -c 'rabbitmqctl cluster_status'
docker exec rabbit-c3 /bin/bash -c 'rabbitmqctl cluster_status'

echo "Starting to create user."
docker exec rabbit-c1 /bin/bash -c 'rabbitmqctl add_user admin admin@123'

echo "Set tags for new user."
docker exec rabbit-c1 /bin/bash -c 'rabbitmqctl set_user_tags admin administrator'

echo "Grant permissions to new user."
docker exec rabbit-c1 /bin/bash -c "rabbitmqctl set_permissions -p '/' admin '.*' '.*' '.*'"
